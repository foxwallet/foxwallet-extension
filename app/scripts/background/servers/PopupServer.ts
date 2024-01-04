import { AuthManager } from "../store/vault/managers/auth/AuthManager";
import { KeyringManager } from "../store/vault/managers/keyring/KeyringManager";
import {
  DisplayKeyring,
  DisplayWallet,
  SelectedAccount,
  WalletType,
} from "../store/vault/types/keyring";
import {
  CreateWalletProps,
  RegenerateWalletProps,
  type IPopupServer,
  ImportHDWalletProps,
  AddAccountProps,
  AleoSendTxProps,
  SetSelectedAccountProps,
  GetSelectedAccountProps,
  RequestFinfishProps,
  ConnectProps,
  RequestTxProps,
  AleoRequestTxProps,
  SignMessageProps,
  AleoRequestDeploymentProps,
  GetSelectedUniqueIdProps,
  SetSelectedUniqueIdProps,
  ResyncAleoProps,
  ImportPrivateKeyProps,
  GetPrivateKeyProps,
} from "./IWalletServer";
import {
  isSendingAleoTransaction,
  sendDeployment,
  sendTransaction,
  stopSync,
  syncBlocks,
} from "../offscreen";
import { AccountSettingStorage } from "../store/account/AccountStorage";
import { DappStorage } from "../store/dapp/DappStorage";
import { CoinType } from "core/types";
import browser from "webextension-polyfill";
import { nanoid } from "nanoid";
import { DappRequest } from "../types/dapp";
import { createPopup } from "../helper/popup";
import { AleoConnectHistory } from "../types/connect";
import { SiteInfo } from "@/scripts/content/host";
import { Transaction } from "core/coins/ALEO/types/AleoTransaction";
import { PrivateKey } from "aleo_wasm";
import { hexToUint8Array } from "@/common/utils/buffer";
import {
  AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Tranaction";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";
import { DEFAULT_UNIQUE_ID_MAP } from "core/constants";

export type OnRequestFinishCallback = (
  error: null | Error,
  data: any,
) => void | Promise<void>;

export class PopupWalletServer implements IPopupServer {
  authManager: AuthManager;
  keyringManager: KeyringManager;
  accountSettingStorage: AccountSettingStorage;
  dappStorage: DappStorage;
  popupRequestIdMap: Array<{ popupId: number; requestId: string }> = [];
  requestIdCallbackMap: { [requestId in string]?: OnRequestFinishCallback } =
    {};
  coinService: CoinServiceEntry;

  constructor(
    authManager: AuthManager,
    keyringManager: KeyringManager,
    dappStorage: DappStorage,
    accountSettingStorage: AccountSettingStorage,
    coinService: CoinServiceEntry,
  ) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
    this.dappStorage = dappStorage;
    this.accountSettingStorage = accountSettingStorage;
    this.coinService = coinService;
    browser.windows.onRemoved.addListener(this.onRemovePopup.bind(this));
  }

  findRequestIdByPopupId(popupId: number) {
    const item = this.popupRequestIdMap.find(
      (item) => item.popupId === popupId,
    );
    if (item) {
      return item.requestId;
    }
    return null;
  }

  findPopupIdByRequestId(requestId: string) {
    const item = this.popupRequestIdMap.find(
      (item) => item.requestId === requestId,
    );
    if (item) {
      return item.popupId;
    }
    return null;
  }

  removeItemByPopupId(popupId: number) {
    const index = this.popupRequestIdMap.findIndex(
      (item) => item.popupId === popupId,
    );
    if (index >= 0) {
      this.popupRequestIdMap.splice(index, 1);
    }
  }

  removeItemByRequestId(requestId: string) {
    const index = this.popupRequestIdMap.findIndex(
      (item) => item.requestId === requestId,
    );
    if (index >= 0) {
      this.popupRequestIdMap.splice(index, 1);
    }
  }

  addItem(popupId: number, requestId: string) {
    const existIndex = this.popupRequestIdMap.findIndex(
      (item) => item.popupId === popupId,
    );
    if (existIndex >= 0) {
      this.popupRequestIdMap[existIndex] = { popupId, requestId };
    } else {
      this.popupRequestIdMap.push({ popupId, requestId });
    }
  }

  async onRemovePopup(windowId: number) {
    const requestId = this.findRequestIdByPopupId(windowId);
    if (requestId) {
      this.removeItemByPopupId(windowId);
      await this.dappStorage.removeDappRequest(requestId);
      const params = {
        requestId,
        error: "user cancel",
      };
      this.onRequestFinish(params);
    }
  }

  async createConnectPopup(params: ConnectProps, siteInfo: SiteInfo) {
    const requestId = nanoid();
    const request: DappRequest = {
      id: requestId,
      type: "connect",
      coinType: CoinType.ALEO,
      siteInfo,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/connect/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          if (error) {
            const popupId = this.findPopupIdByRequestId(requestId);
            if (popupId) {
              browser.windows.remove(popupId);
            }
            reject(error);
            return;
          }
          const connectHistory: AleoConnectHistory = {
            site: siteInfo,
            ...params,
            lastConnectTime: Date.now(),
          };
          await this.dappStorage.addConnectHistory(
            CoinType.ALEO,
            data,
            connectHistory,
          );
          await browser.windows.remove(popupId);
          resolve(data);
          return;
        };
      } else {
        resolve(null);
      }
    });
  }

  async createRequestTxPopup(params: AleoRequestTxProps, siteInfo: SiteInfo) {
    const { coinType, address, localId } = params;
    const requestId = nanoid();
    const request: DappRequest = {
      id: requestId,
      type: "requestTransaction",
      coinType: CoinType.ALEO,
      siteInfo,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/request_tx/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          if (error) {
            const popupId = this.findPopupIdByRequestId(requestId);
            if (popupId) {
              browser.windows.remove(popupId);
            }
            reject(error);
            return;
          }
          const txInfo: AleoLocalTxInfo = {
            ...params,
            status: AleoTxStatus.QUEUED,
          };
          await this.coinService
            .getInstance(InnerChainUniqueId.ALEO_TESTNET3)
            .setAddressLocalTx(address, txInfo);
          const pk = await this.keyringManager.getPrivateKeyByAddress({
            coinType,
            address,
          });
          if (!pk) {
            reject(new Error("Get private key failed"));
            return;
          }
          await browser.windows.remove(popupId);

          sendTransaction({
            ...params,
            privateKey: pk,
          });
          resolve(localId);
          return;
        };
      } else {
        resolve(null);
      }
    });
  }

  async createRequestDeployPopup(
    params: AleoRequestDeploymentProps,
    siteInfo: SiteInfo,
  ) {
    const { coinType, address, localId } = params;
    const requestId = nanoid();
    const request: DappRequest = {
      id: requestId,
      type: "requestDeploy",
      coinType: CoinType.ALEO,
      siteInfo,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/request_deploy/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          if (error) {
            const popupId = this.findPopupIdByRequestId(requestId);
            if (popupId) {
              browser.windows.remove(popupId);
            }
            reject(error);
            return;
          }
          const txInfo: AleoLocalTxInfo = {
            ...params,
            functionName: "",
            inputs: [],
            status: AleoTxStatus.QUEUED,
            deploy: true,
          };
          await this.coinService
            .getInstance(InnerChainUniqueId.ALEO_TESTNET3)
            .setAddressLocalTx(address, txInfo);
          const pk = await this.keyringManager.getPrivateKeyByAddress({
            coinType,
            address,
          });
          if (!pk) {
            reject(new Error("Get private key failed"));
            return;
          }
          await browser.windows.remove(popupId);

          sendDeployment({
            ...params,
            privateKey: pk,
          });
          resolve(localId);
          return;
        };
      } else {
        resolve(null);
      }
    });
  }

  async creatSignMessagePopup(
    params: SignMessageProps,
    address: string,
    siteInfo: SiteInfo,
  ) {
    const { message } = params;
    const requestId = nanoid();
    const request: DappRequest = {
      id: requestId,
      type: "signMessage",
      coinType: CoinType.ALEO,
      siteInfo,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      try {
        const popup = await createPopup(`/sign_message/${requestId}`);
        const popupId = popup.id;
        if (popupId) {
          this.addItem(popupId, requestId);
          this.requestIdCallbackMap[requestId] = async (
            error,
            data: string,
          ) => {
            if (error) {
              const popupId = this.findPopupIdByRequestId(requestId);
              if (popupId) {
                browser.windows.remove(popupId);
              }
              reject(error);
              return;
            }
            const messageArray = hexToUint8Array(message);
            const pk = await this.keyringManager.getPrivateKeyByAddress({
              coinType: CoinType.ALEO,
              address,
            });
            if (!pk) {
              reject(new Error("Get private key failed"));
              return;
            }
            await browser.windows.remove(popupId);
            const privateKey = PrivateKey.from_string(pk);
            const signature = privateKey.sign(messageArray).to_hex();
            resolve(signature);
          };
        } else {
          resolve(null);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async onRequestFinish(params: RequestFinfishProps): Promise<void> {
    const { requestId, error, data } = params;
    const callback = this.requestIdCallbackMap[requestId];
    if (callback) {
      delete this.requestIdCallbackMap[requestId];
      callback(error ? new Error(error) : null, data);
      await this.dappStorage.removeDappRequest(requestId);
    }
    this.removeItemByRequestId(requestId);
  }

  async initPassword(params: { password: string }): Promise<boolean> {
    if (this.authManager.getToken()) {
      const existWallet = await this.keyringManager.getAllWallet();
      if (existWallet[WalletType.HD] && existWallet[WalletType.HD].length > 0) {
        throw new Error("Password already inited && wallets exist");
      }
    }
    await this.authManager.initPassword(params.password);
    await this.keyringManager.reset();
    return true;
  }

  async hasAuth(params: { checkExpire?: boolean }): Promise<boolean> {
    console.log("===> popup server hasAuth: ", params);
    const result = this.authManager.hasAuth(params.checkExpire);
    return result;
  }

  async login(params: { password: string }): Promise<boolean> {
    return await this.authManager.login(params.password);
  }

  async lock(): Promise<void> {
    return this.authManager.lock();
  }

  async timeoutLock(): Promise<void> {
    return this.authManager.timeoutLock();
  }

  async createWallet(params: CreateWalletProps): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.createNewWallet(params);
    const account = wallet.accountsMap[CoinType.ALEO][0];
    if (account) {
      await this.setSelectedAccount({
        selectAccount: {
          walletId: wallet.walletId,
          coinType: CoinType.ALEO,
          ...account,
        },
      });
    }
    return wallet;
  }

  async regenerateWallet(
    params: RegenerateWalletProps,
  ): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.regenerateWallet(params);
    const account = wallet.accountsMap[CoinType.ALEO][0];
    if (account) {
      await this.setSelectedAccount({
        selectAccount: {
          walletId: wallet.walletId,
          coinType: CoinType.ALEO,
          ...account,
        },
      });
    }
    return wallet;
  }

  async importHDWallet(params: ImportHDWalletProps): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.importHDWallet(params);
    const account = wallet.accountsMap[CoinType.ALEO][0];
    if (account) {
      await this.setSelectedAccount({
        selectAccount: {
          walletId: wallet.walletId,
          coinType: CoinType.ALEO,
          ...account,
        },
      });
    }
    return wallet;
  }

  async addAccount(params: AddAccountProps): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.addNewAccount(params);
    const accounts = wallet.accountsMap[params.coinType];
    const account = accounts[accounts.length - 1];
    if (account) {
      await this.setSelectedAccount({
        selectAccount: {
          walletId: wallet.walletId,
          coinType: params.coinType,
          ...account,
        },
      });
    }
    return wallet;
  }

  async importPrivateKey<T extends CoinType>(
    params: ImportPrivateKeyProps<T>,
  ): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.importPrivateKey(params);
    const account = wallet.accountsMap[params.coinType][0];
    if (account) {
      await this.setSelectedAccount({
        selectAccount: {
          walletId: wallet.walletId,
          coinType: params.coinType,
          ...account,
        },
      });
    }
    return wallet;
  }

  async getSelectedAccount(
    params: GetSelectedAccountProps,
  ): Promise<SelectedAccount | null> {
    const selectedAccount = await this.accountSettingStorage.getSelectedAccount(
      params.coinType,
    );
    if (selectedAccount) {
      return selectedAccount;
    }
    const existKeyring = await this.keyringManager.getAllWallet(true);
    const existWallet = existKeyring[WalletType.HD]?.[0];
    if (existWallet) {
      const existAccount = existWallet.accountsMap[params.coinType][0];
      if (existAccount) {
        const newSelectedAccount = {
          walletId: existWallet.walletId,
          coinType: params.coinType,
          ...existAccount,
        };
        await this.setSelectedAccount({ selectAccount: newSelectedAccount });
        return newSelectedAccount;
      }
    }
    return null;
  }

  async setSelectedAccount(
    params: SetSelectedAccountProps,
  ): Promise<SelectedAccount> {
    return await this.accountSettingStorage.setSelectedAccount(
      params.selectAccount,
    );
  }

  async getSelectedUniqueId(
    params: GetSelectedUniqueIdProps,
  ): Promise<ChainUniqueId> {
    const { coinType } = params;
    const selectedUniqueId =
      await this.accountSettingStorage.getSelectedUniqueId(coinType);
    return selectedUniqueId;
  }

  async setSelectedUniqueId(
    params: SetSelectedUniqueIdProps,
  ): Promise<ChainUniqueId> {
    const { uniqueId } = params;
    return await this.accountSettingStorage.setSelectedUniqueId(uniqueId);
  }

  async getHDWallet(walletId: string): Promise<DisplayWallet> {
    return await this.keyringManager.getHDWallet(walletId);
  }

  async getSimpleWallet(walletId: string): Promise<DisplayWallet> {
    return await this.keyringManager.getSimpleWallet(walletId);
  }

  async getAllWallet(): Promise<DisplayKeyring> {
    return await this.keyringManager.getAllWallet();
  }

  async rescanAleo(params: ResyncAleoProps): Promise<boolean> {
    const { uniqueId, account } = params;
    // stop sync
    await stopSync();
    // clear local data
    await this.coinService
      .getInstance(uniqueId)
      .clearAddressLocalData(account.address);
    // continue sync
    await syncBlocks();
    return true;
  }

  async sendAleoTransaction(params: AleoSendTxProps): Promise<void> {
    const { walletId, accountId, coinType, ...rest } = params;
    const pk = await this.keyringManager.getPrivateKey({
      walletId,
      coinType,
      accountId,
    });
    sendTransaction({
      ...rest,
      privateKey: pk,
    });
    // const tx = await sendTransaction({
    //   ...rest,
    //   privateKey: pk,
    // });
    // console.log("===> sendAleoTransaction resp: ", tx);
    // if (tx.payload?.error) {
    //   throw new Error(tx.payload.error);
    // }
    // return tx.payload.data;
  }

  async isSendingAleoTransaction(): Promise<boolean> {
    return await isSendingAleoTransaction();
  }

  async getHDMnemonic(walletId: string): Promise<string> {
    return await this.keyringManager.getHDMnemonic(walletId);
  }

  async deleteWallet(walletId: string): Promise<DisplayKeyring> {
    await stopSync();
    const selectedAccount = await this.accountSettingStorage.getSelectedAccount(
      CoinType.ALEO,
    );
    let newSelectedAccount: SelectedAccount | null = null;
    if (selectedAccount?.walletId === walletId) {
      const allWallets = await this.keyringManager.getAllWallet(false);
      if (allWallets) {
        const otherHDWallet = allWallets[WalletType.HD]?.filter(
          (item) => item.walletId !== walletId,
        )[0];
        if (otherHDWallet) {
          const otherAccount = otherHDWallet.accountsMap[CoinType.ALEO][0];
          if (otherAccount) {
            newSelectedAccount = {
              walletId: otherHDWallet.walletId,
              coinType: CoinType.ALEO,
              ...otherAccount,
            };
          }
        } else {
          const otherSimpleWallet = allWallets[WalletType.SIMPLE]?.filter(
            (item) => item.walletId !== walletId,
          )[0];
          if (otherSimpleWallet) {
            const otherAccount =
              otherSimpleWallet.accountsMap[CoinType.ALEO][0];
            if (otherAccount) {
              newSelectedAccount = {
                walletId: otherSimpleWallet.walletId,
                coinType: CoinType.ALEO,
                ...otherAccount,
              };
            }
          }
        }
      }
      if (newSelectedAccount) {
        await this.accountSettingStorage.setSelectedAccount(newSelectedAccount);
      } else {
        await this.accountSettingStorage.removeSelectedAccount(CoinType.ALEO);
      }
    }
    await this.keyringManager.deleteWallet(walletId);
    syncBlocks();
    return await this.getAllWallet();
  }

  async getPrivateKey({
    walletId,
    coinType,
    accountId,
  }: GetPrivateKeyProps): Promise<string> {
    return await this.keyringManager.getPrivateKey({
      walletId,
      coinType,
      accountId,
    });
  }

  async checkPassword(password: string): Promise<boolean> {
    return await this.authManager.checkPassword(password);
  }
}
