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
} from "./IWalletServer";
import { sendTransaction } from "../offscreen";
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

  constructor(
    authManager: AuthManager,
    keyringManager: KeyringManager,
    dappStorage: DappStorage,
    accountSettingStorage: AccountSettingStorage,
  ) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
    this.dappStorage = dappStorage;
    this.accountSettingStorage = accountSettingStorage;
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
      throw new Error("Password already inited");
    }
    await this.authManager.initPassword(params.password);
    await this.keyringManager.reset();
    return true;
  }

  async hasAuth(params: { checkExpire?: boolean }): Promise<boolean> {
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
    return await this.keyringManager.createNewWallet(params);
  }

  async regenerateWallet(
    params: RegenerateWalletProps,
  ): Promise<DisplayWallet> {
    return await this.keyringManager.regenerateWallet(params);
  }

  async importHDWallet(params: ImportHDWalletProps): Promise<DisplayWallet> {
    return await this.keyringManager.importHDWallet(params);
  }

  async addAccount(params: AddAccountProps): Promise<DisplayWallet> {
    return await this.keyringManager.addNewAccount(params);
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

  async getAllWallet(): Promise<DisplayKeyring> {
    return await this.keyringManager.getAllWallet();
  }

  async sendAleoTransaction(params: AleoSendTxProps): Promise<Transaction> {
    const { walletId, accountId, coinType, ...rest } = params;
    const pk = await this.keyringManager.getPrivateKey({
      walletId,
      coinType,
      accountId,
    });
    const tx = await sendTransaction({
      ...rest,
      privateKey: pk,
    });
    console.log("===> sendAleoTransaction resp: ", tx);
    if (tx.payload?.error) {
      throw new Error(tx.payload.error);
    }
    return tx.payload.data;
  }
}
