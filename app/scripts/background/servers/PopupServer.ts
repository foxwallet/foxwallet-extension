import { AuthManager } from "../store/vault/managers/auth/AuthManager";
import { KeyringManager } from "../store/vault/managers/keyring/KeyringManager";
import {
  DisplayKeyring,
  DisplayWallet,
  OneMatchGroupAccount,
  WalletType,
} from "../store/vault/types/keyring";
import {
  AddAccountProps,
  ALEOConnectProps,
  AleoComplianceProofProps,
  AleoRequestDeploymentProps,
  AleoRequestTxProps,
  AleoSendTxProps,
  ConnectProps,
  CreateWalletProps,
  GetPrivateKeyProps,
  GetSelectedAccountProps,
  ImportHDWalletProps,
  ImportPrivateKeyProps,
  type IPopupServer,
  PopupSignMessageProps,
  RegenerateWalletProps,
  RequestFinfishProps,
  ScannerDeactivateViewConsumerProps,
  ScannerGetDecryptedOwnedRecordsProps,
  ScannerRegisterProps,
  ScannerRegisterResp,
  SetSelectedAccountProps,
  SignMessageProps,
  SiteMetadata,
} from "./IWalletServer";
import {
  isSendingAleoTransaction,
  sendAleoTransaction,
  sendDeployment,
  stopSending,
} from "../offscreen";
import { AccountSettingStorage } from "../store/account/AccountStorage";
import { DappStorage } from "../store/dapp/DappStorage";
import { CoinType } from "core/types";
import browser from "webextension-polyfill";
import { nanoid } from "nanoid";
import { createPopup } from "../helper/popup";
import { SiteInfo } from "@/scripts/content/host";
import { PrivateKey } from "provable-wasm-no-tla/mainnet.js";
import { hexToUint8Array } from "@/common/utils/buffer";
import {
  AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Transaction";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { ConnectHistory, DappRequest } from "@/database/types/dapp";
import { AleoTxType } from "core/coins/ALEO/types/History";
import {
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
import { matchAccountFromGroupAccount } from "../utils/account";
import { getDefaultChainUniqueId } from "core/constants/chain";
import { AleoService } from "core/coins/ALEO/service/AleoService";
import { GasFee } from "core/types/GasFee";
import { isSameAddress } from "core/utils/address";
import { JSONParseWithBigInt } from "@/common/utils/json";
import { EthService } from "core/coins/ETH/service/EthService";
import {
  decodeEvmAddress,
  getEvmAddress,
  getQtumChainId,
} from "core/coins/QTUM/utils/address";
import { wrapLoggerArgs } from "@/common/utils/wrapConsole";
import { QTUMNetwork } from "core/coins/QTUM/types/QTUMAccount";
import {
  networkFromChainId,
  provableScannerService,
  recordSyncService,
  ScannerStorage,
  type SyncStatusResp,
} from "core/coins/ALEO/service/scanner";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { AleoStorage } from "../store/aleo/AleoStorage";

// Tag value that hydrateRecordParsedContent uses to recognize a BigInt that
// was flattened to string for chrome.runtime port serialization. Keeping it
// unusual avoids collisions with any genuine record string value.
const BIGINT_PORT_TAG = "__bigint__:";

function stringifyBigInt(value: bigint | string): string {
  return typeof value === "bigint"
    ? `${BIGINT_PORT_TAG}${value.toString()}`
    : value;
}

function serializeRecordForPort(
  record: RecordDetailWithSpent,
): RecordDetailWithSpent {
  if (!record.parsedContent) return record;
  const next: Record<string, string | bigint> = {};
  for (const [key, value] of Object.entries(record.parsedContent)) {
    next[key] = stringifyBigInt(value);
  }
  return {
    ...record,
    parsedContent: next as unknown as RecordDetailWithSpent["parsedContent"],
  };
}

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
  #aleoScannerPrewarmed = false;

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

  async createALEOConnectPopup(params: ALEOConnectProps, siteInfo: SiteInfo) {
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      InnerChainUniqueId.ALEO_MAINNET,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    const request: DappRequest = {
      id: requestId,
      type: "connect",
      coinType: CoinType.ALEO,
      siteInfo,
      address: selectedAccount.account.address,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/connect_aleo/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          try {
            if (error) {
              const popupId = this.findPopupIdByRequestId(requestId);
              if (popupId) {
                browser.windows.remove(popupId);
              }
              reject(error);
              return;
            }
            const connectHistory: ConnectHistory = {
              site: siteInfo,
              coinType: CoinType.ALEO,
              ...params,
              address: data,
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
          } catch (err) {
            console.error("createConnectPopup callback error: ", err);
            reject(err);
          }
        };
      } else {
        resolve(null);
      }
    });
  }

  async createConnectPopup(params: ConnectProps, siteInfo: SiteInfo) {
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const { coinType, network } = params;
    // qtum address is chain dependent, eth is not
    let chainUniqueId = getDefaultChainUniqueId(coinType, {});
    if (network) {
      switch (network) {
        case "0x51":
          chainUniqueId = InnerChainUniqueId.QTUM;
          break;
        case "0x22B9":
          chainUniqueId = InnerChainUniqueId.QTUM_TESTNET;
          break;
      }
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      chainUniqueId,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    const request: DappRequest = {
      id: requestId,
      type: "connect",
      coinType: coinType,
      siteInfo,
      address: selectedAccount.account.address,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/connect/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          try {
            if (error) {
              const popupId = this.findPopupIdByRequestId(requestId);
              if (popupId) {
                browser.windows.remove(popupId);
              }
              reject(error);
              return;
            }
            const connectHistory = {
              site: siteInfo,
              ...params,
              address: data,
              lastConnectTime: Date.now(),
              network: "",
            };
            await this.dappStorage.addConnectHistory(
              coinType,
              data,
              connectHistory,
            );
            await browser.windows.remove(popupId);
            resolve(data);
            return;
          } catch (err) {
            console.error("createConnectPopup callback error: ", err);
            reject(err);
          }
        };
      } else {
        resolve(null);
      }
    });
  }

  async createRequestTxPopup(params: any, siteInfo: SiteInfo) {
    // {
    //   uniqueId: currUniqueId,
    // coinType
    //   from,
    //     to,
    //     value,
    //     data,
    //     replaceGasFeeData: {
    //   type,
    //     gasLimit: gasLimit,
    //     gasPrice: formatGasPrice,
    //     maxFeePerGas: formatMaxFeePerGas?.toBigInt(),
    //     maxPriorityFeePerGas: formatMaxPriorityFeePerGas?.toBigInt(),
    //     estimateGas: estimateGas.toBigInt(),
    // } as GasFeeEIP1559 | GasFeeLegacy,
    // },
    const {
      uniqueId,
      coinType,
      from,
      to,
      value,
      data: paramsData,
      replaceGasFeeData,
    } = params;
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      uniqueId,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    if (
      coinType === CoinType.QTUM &&
      !isSameAddress(getEvmAddress(selectedAccount.account.address), from)
    ) {
      throw new Error("Selected account is not match");
    }
    if (
      coinType !== CoinType.QTUM &&
      !isSameAddress(selectedAccount.account.address, from)
    ) {
      throw new Error("Selected account is not match");
    }
    const request: DappRequest = {
      id: requestId,
      type: "requestTransaction",
      coinType,
      siteInfo,
      address: params.from,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/request_tx/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          try {
            if (error) {
              const popupId = this.findPopupIdByRequestId(requestId);
              if (popupId) {
                browser.windows.remove(popupId);
              }
              reject(error);
              return;
            }
            const { gasFee, from } = JSONParseWithBigInt(data);

            const pk = await this.keyringManager.getPrivateKeyByAddress({
              coinType,
              address: from,
            });
            if (!pk) {
              reject(new Error("Get private key failed"));
              return;
            }
            // const gasFees = JSON.parse(JSONStringifyOmitBigInt(gasFee));
            // resolve(gasFee);
            const instance = this.coinService.getInstance(
              params.uniqueId,
            ) as EthService;
            console.log(
              ...wrapLoggerArgs("createRequestTxPopup" + params.uniqueId),
            );

            const rawTxWrap = await instance.getNativeCoinRawTx({
              tx: {
                from,
                to,
                value,
                gasFee: gasFee as GasFee<CoinType.ETH>,
                data: paramsData,
              },
              signer: {
                privateKey: pk,
              },
            });
            const { id } = rawTxWrap;
            await browser.windows.remove(popupId);
            if (id) {
              resolve(id);
              void instance.sendSignedTxRaw(rawTxWrap);
            } else {
              reject(new Error("invalid result"));
              return;
            }
            return;
          } catch (err) {
            console.error("createRequestTxPopup callback error: ", err);
            reject(err);
          }
        };
      } else {
        resolve(null);
      }
    });
  }

  async createRequestAleoTxPopup(
    params: AleoRequestTxProps,
    siteInfo: SiteInfo,
  ) {
    const { coinType, address, localId } = params;
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      InnerChainUniqueId.ALEO_MAINNET,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    if (selectedAccount.account.address !== address) {
      throw new Error("Selected account is not match");
    }
    const request: DappRequest = {
      id: requestId,
      type: "requestTransaction",
      coinType: CoinType.ALEO,
      siteInfo,
      address: params.address,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/request_aleo_tx/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          try {
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
            params.tokenId = NATIVE_TOKEN_TOKEN_ID;
            const txInfo: AleoLocalTxInfo = {
              ...params,
              txType: AleoTxType.EXECUTION,
              status: AleoTxStatus.QUEUED,
              notification: false,
            };
            const instance = this.coinService.getInstance(
              params.uniqueId,
            ) as AleoService;
            await instance.setAddressLocalTx(address, txInfo);
            await browser.windows.remove(popupId);

            sendAleoTransaction({
              ...params,
              privateKey: pk,
            }).then(async (resp) => {
              console.log(
                "===> createRequestAleoTxPopup sendTransaction resp: ",
                resp,
              );
              console.log(
                "===> createRequestAleoTxPopup sendTransaction payload: ",
                {
                  error: resp?.payload?.error,
                  data: resp?.payload?.data,
                },
              );
              const error = resp?.payload?.error;
              if (!resp || error) {
                const finalTxInfo: AleoLocalTxInfo = {
                  ...params,
                  status: AleoTxStatus.FAILED,
                  txType: AleoTxType.EXECUTION,
                  notification: false,
                  error: error ?? "sendTransaction failed",
                };
                await instance.setAddressLocalTx(address, finalTxInfo);
              }
            });
            resolve(localId);
            return;
          } catch (err) {
            console.error("createRequestAleoTxPopup callback error: ", err);
            reject(err);
          }
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
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      InnerChainUniqueId.ALEO_MAINNET,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    if (selectedAccount.account.address !== address) {
      throw new Error("Selected account is not match");
    }
    const request: DappRequest = {
      id: requestId,
      type: "requestDeploy",
      coinType: CoinType.ALEO,
      siteInfo,
      address: address,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      const popup = await createPopup(`/request_deploy/${requestId}`);
      const popupId = popup.id;
      if (popupId) {
        this.addItem(popupId, requestId);
        this.requestIdCallbackMap[requestId] = async (error, data: string) => {
          try {
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
            const txInfo: AleoLocalTxInfo = {
              ...params,
              functionName: "",
              inputs: [],
              status: AleoTxStatus.QUEUED,
              txType: AleoTxType.DEPLOYMENT,
              notification: false,
              tokenId: NATIVE_TOKEN_TOKEN_ID,
            };
            const instance = this.coinService.getInstance(
              params.uniqueId,
            ) as AleoService;
            await instance.setAddressLocalTx(address, txInfo);
            await browser.windows.remove(popupId);

            sendDeployment({
              ...params,
              privateKey: pk,
            }).then(async (resp) => {
              console.log("===> createRequestDeployPopup resp: ", resp);
              const error = resp?.payload?.error;
              if (!resp || error) {
                const finalTxInfo: AleoLocalTxInfo = {
                  ...params,
                  functionName: "",
                  inputs: [],
                  status: AleoTxStatus.FAILED,
                  txType: AleoTxType.DEPLOYMENT,
                  notification: false,
                  error: error ?? "sendDeployment failed",
                  tokenId: NATIVE_TOKEN_PROGRAM_ID,
                };
                await instance.setAddressLocalTx(address, finalTxInfo);
              }
            });
            resolve(localId);
            return;
          } catch (err) {
            console.error("createRequestDeployPopup callback error: ", err);
            reject(err);
          }
        };
      } else {
        resolve(null);
      }
    });
  }

  async createAleoSignMessagePopup(
    params: SignMessageProps,
    address: string,
    siteInfo: SiteInfo,
  ) {
    const { message } = params;
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      InnerChainUniqueId.ALEO_MAINNET,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    const request: DappRequest = {
      id: requestId,
      type: "signMessage",
      coinType: CoinType.ALEO,
      siteInfo,
      address: selectedAccount.account.address,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<string | null>(async (resolve, reject) => {
      try {
        const popup = await createPopup(`/sign_aleo_message/${requestId}`);
        const popupId = popup.id;
        if (popupId) {
          this.addItem(popupId, requestId);
          this.requestIdCallbackMap[requestId] = async (
            error,
            data: string,
          ) => {
            try {
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
              const signature = privateKey.sign(messageArray).to_string();
              resolve(signature);
            } catch (err) {
              console.error("createAleoSignMessagePopup callback error: ", err);
              reject(err);
            }
          };
        } else {
          resolve(null);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async createSignMessagePopup(
    params: SignMessageProps,
    address: string,
    coinType: CoinType,
    siteMetadata: SiteMetadata,
  ) {
    const { message } = params;
    const { siteInfo, network } = siteMetadata;
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    // qtum address is chain dependent, eth is not
    let chainUniqueId = getDefaultChainUniqueId(coinType, {});
    if (network) {
      switch (network) {
        case "0x51":
          chainUniqueId = InnerChainUniqueId.QTUM;
          break;
        case "0x22B9":
          chainUniqueId = InnerChainUniqueId.QTUM_TESTNET;
          break;
      }
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      chainUniqueId,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    const request: DappRequest = {
      id: requestId,
      type: "signMessage",
      coinType: coinType,
      siteInfo,
      address: address,
      payload: { ...params, network },
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<boolean | null>(async (resolve, reject) => {
      try {
        const popup = await createPopup(`/sign_message/${requestId}`);
        const popupId = popup.id;
        if (popupId) {
          this.addItem(popupId, requestId);
          this.requestIdCallbackMap[requestId] = async (
            error,
            data: string,
          ) => {
            try {
              if (error) {
                const popupId = this.findPopupIdByRequestId(requestId);
                if (popupId) {
                  browser.windows.remove(popupId);
                }
                reject(error);
                return;
              }
              let realAddress: string = address;
              if (coinType === CoinType.QTUM) {
                let qNetwork = QTUMNetwork.qtum;
                if (network) {
                  switch (network) {
                    case "0x51":
                      qNetwork = QTUMNetwork.qtum;
                      break;
                    case "0x22B9":
                      qNetwork = QTUMNetwork.qtumTestnet;
                      break;
                  }
                }
                realAddress = decodeEvmAddress(
                  address,
                  getQtumChainId(qNetwork),
                );
              }
              const pk = await this.keyringManager.getPrivateKeyByAddress({
                coinType: coinType,
                address: realAddress,
              });
              if (!pk) {
                reject(new Error("Get private key failed"));
                return;
              }
              await browser.windows.remove(popupId);
              resolve(true);
            } catch (err) {
              console.error("createSignMessagePopup callback error: ", err);
              reject(err);
            }
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
    return true;
  }

  async hasAuth(): Promise<boolean> {
    console.log("===> popup server hasAuth: ");
    const result = this.authManager.hasAuth();
    if (result) {
      void this.prewarmAleoScannerRegistrations();
    }
    return result;
  }

  async login(params: { password: string }): Promise<boolean> {
    const ok = await this.authManager.login(params.password);
    if (ok) {
      void this.prewarmAleoScannerRegistrations();
    }
    return ok;
  }

  private async prewarmAleoScannerRegistrations(): Promise<void> {
    if (this.#aleoScannerPrewarmed) return;
    if (!this.authManager.hasAuth()) return;
    this.#aleoScannerPrewarmed = true;

    try {
      const chainId = InnerChainUniqueId.ALEO_MAINNET;
      const addresses = await AleoStorage.getInstance().getAccountsAddress();
      if (addresses.length === 0) return;

      await Promise.allSettled(
        addresses.map(async (address) => {
          try {
            await this.ensureScannerRegistration({ chainId, address });
          } catch (error) {
            console.warn("[RSS] prewarm scanner registration failed", {
              address,
              error,
            });
          }
        }),
      );
    } catch (error) {
      this.#aleoScannerPrewarmed = false;
      console.warn("[RSS] prewarm scanner registrations aborted", error);
    }
  }

  async lock(): Promise<void> {
    return this.authManager.lock();
  }

  async timeoutLock(): Promise<void> {
    return this.authManager.timeoutLock();
  }

  async clearTimeoutLock(): Promise<void> {
    return this.authManager.clearTimeoutLock();
  }

  async createWallet(params: CreateWalletProps): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.createNewWallet(params);
    const { groupAccounts, ...restWallet } = wallet;
    if (groupAccounts[0]) {
      const newGroupAccount = {
        wallet: restWallet,
        group: groupAccounts[0],
      };

      await this.setSelectedGroupAccount({
        groupAccount: newGroupAccount,
      });
    }
    return wallet;
  }

  async regenerateWallet(
    params: RegenerateWalletProps,
  ): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.regenerateWallet(params);
    const { groupAccounts, ...restWallet } = wallet;

    if (groupAccounts[0]) {
      const newGroupAccount = {
        wallet: restWallet,
        group: groupAccounts[0],
      };

      await this.setSelectedGroupAccount({
        groupAccount: newGroupAccount,
      });
    }
    return wallet;
  }

  async importHDWallet(params: ImportHDWalletProps): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.importHDWallet(params);
    const { groupAccounts, ...restWallet } = wallet;

    if (groupAccounts[0]) {
      const newGroupAccount = {
        wallet: restWallet,
        group: groupAccounts[0],
      };

      await this.setSelectedGroupAccount({
        groupAccount: newGroupAccount,
      });
    }
    return wallet;
  }

  async addAccount(params: AddAccountProps): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.addNewAccount(params);
    const { groupAccounts, ...restWallet } = wallet;
    const groupAccount = groupAccounts[groupAccounts.length - 1];
    if (groupAccount) {
      const newGroupAccount = {
        wallet: restWallet,
        group: groupAccount,
      };

      await this.setSelectedGroupAccount({
        groupAccount: newGroupAccount,
      });
    }
    return wallet;
  }

  async importPrivateKey<T extends CoinType>(
    params: ImportPrivateKeyProps<T>,
  ): Promise<DisplayWallet> {
    const wallet = await this.keyringManager.importPrivateKey(params);
    const { groupAccounts, ...restWallet } = wallet;

    if (groupAccounts[0]) {
      const newGroupAccount = {
        wallet: restWallet,
        group: groupAccounts[0],
      };

      await this.setSelectedGroupAccount({
        groupAccount: newGroupAccount,
      });
    }
    return wallet;
  }

  async getSelectedGroupAccount(
    params?: GetSelectedAccountProps,
  ): Promise<OneMatchGroupAccount | null> {
    const selectedAccount =
      await this.accountSettingStorage.getSelectedGroupAccount();
    if (selectedAccount) {
      return selectedAccount;
    }
    const existKeyring = await this.keyringManager.getAllWallet(true);
    const existWallet = existKeyring[WalletType.HD]?.[0];
    if (existWallet) {
      const { groupAccounts, ...restWallet } = existWallet;
      const existAccount = groupAccounts[0];
      if (existAccount) {
        const newSelectedAccount = {
          wallet: restWallet,
          group: existAccount,
        };
        await this.setSelectedGroupAccount({
          groupAccount: newSelectedAccount,
        });
        return newSelectedAccount;
      }
    }
    return null;
  }

  async setSelectedGroupAccount({
    groupAccount,
  }: SetSelectedAccountProps): Promise<OneMatchGroupAccount> {
    await this.accountSettingStorage.setSelectedGroupAccount(groupAccount);
    return groupAccount;
  }

  // async getSelectedUniqueId(
  //   params: GetSelectedUniqueIdProps,
  // ): Promise<ChainUniqueId> {
  //   const { coinType } = params;
  //   const selectedUniqueId =
  //     await this.accountSettingStorage.getSelectedUniqueId(coinType);
  //   return selectedUniqueId;
  // }

  // async setSelectedUniqueId(
  //   params: SetSelectedUniqueIdProps,
  // ): Promise<ChainUniqueId> {
  //   const { uniqueId } = params;
  //   return await this.accountSettingStorage.setSelectedUniqueId(uniqueId);
  // }

  async getHDWallet(walletId: string): Promise<DisplayWallet> {
    return await this.keyringManager.getHDWallet(walletId);
  }

  async getSimpleWallet(walletId: string): Promise<DisplayWallet> {
    return await this.keyringManager.getSimpleWallet(walletId);
  }

  async getAllWallet(): Promise<DisplayKeyring> {
    return await this.keyringManager.getAllWallet();
  }

  async rescanAleo(): Promise<boolean> {
    try {
      await stopSending();
      const groupAccount = await this.getSelectedGroupAccount({});
      const account = groupAccount?.group.accounts.find(
        (account) => account.coinType === CoinType.ALEO,
      );
      if (groupAccount && account) {
        const selectedUniqueId = InnerChainUniqueId.ALEO_MAINNET;
        const instance = this.coinService.getInstance(
          selectedUniqueId,
        ) as AleoService;
        await instance.clearAddressLocalData(account.address);
      }
      return true;
    } catch (err) {
      console.error("===> rescanAleo error: ", err);
      return false;
    }
  }

  async resetChain(): Promise<boolean> {
    try {
      await stopSending();
      const instance = this.coinService.getInstance(
        InnerChainUniqueId.ALEO_MAINNET,
      ) as AleoService;
      await instance.resetChainData();
      return true;
    } catch (err) {
      console.error("===> resetChain error: ", err);
      return false;
    }
  }

  private async ensureScannerRegistration(
    { chainId, address }: ScannerRegisterProps,
    viewKey?: string,
  ): Promise<ScannerRegisterResp> {
    const scannerStorage = ScannerStorage.getInstance();
    const existingUuid = await scannerStorage.getScannerUuid(chainId, address);
    if (existingUuid) {
      return { uuid: existingUuid };
    }

    const resolvedViewKey =
      viewKey ??
      (await this.keyringManager.getViewKey({
        coinType: CoinType.ALEO,
        address,
      }));
    if (!resolvedViewKey) {
      throw new Error("Aleo view key is required for scanner registration");
    }

    const registration = await provableScannerService.scannerRegister(
      {
        start: 0,
        viewKey: resolvedViewKey,
      },
      networkFromChainId(chainId),
      {
        address,
        chainId,
      },
    );
    if (!registration?.uuid) {
      throw new Error("Scanner registration failed");
    }
    return { uuid: registration.uuid };
  }

  async scannerRegister(
    params: ScannerRegisterProps,
  ): Promise<ScannerRegisterResp> {
    return await this.ensureScannerRegistration(params);
  }

  async scannerGetDecryptedOwnedRecords({
    chainId,
    address,
    programs,
    unspent,
    consumerId,
    purpose = "default",
    refreshMode = "auto",
    start,
    end,
  }: ScannerGetDecryptedOwnedRecordsProps): Promise<RecordDetailWithSpent[]> {
    if (purpose === "view" && !consumerId) {
      throw new Error(
        "scannerGetDecryptedOwnedRecords: view purpose requires consumerId",
      );
    }

    const viewKey = await this.keyringManager.getViewKey({
      coinType: CoinType.ALEO,
      address,
    });
    if (!viewKey) {
      throw new Error("Aleo view key is required to decrypt scanner records");
    }
    const { uuid } = await this.ensureScannerRegistration(
      {
        chainId,
        address,
      },
      viewKey,
    );

    const records = await recordSyncService.getDecryptedOwnedRecords(
      {
        filter: {
          ...(programs && programs.length > 0 ? { programs } : {}),
          ...(start !== undefined ? { start } : {}),
          ...(end !== undefined ? { end } : {}),
        },
        uuid,
        ...(unspent !== undefined ? { unspent } : {}),
      },
      {
        address,
        viewKey,
      },
      {
        chainId,
        consumerId,
        purpose,
        refreshMode,
      },
    );

    // chrome.runtime port serializes payloads via JSON, which does not
    // support BigInt. parseRecordParsedContent emits bigint values for
    // microcredits / amount; flatten them to string here and let the popup
    // client hydrate them back on receipt. Keeps the wire format JSON-safe
    // without forcing every consumer to switch to string semantics.
    return (records ?? []).map(serializeRecordForPort);
  }

  async scannerGetSyncStatus(
    params: ScannerRegisterProps,
  ): Promise<SyncStatusResp> {
    const { chainId, address } = params;
    const scannerStorage = ScannerStorage.getInstance();
    const uuid = await scannerStorage.getScannerUuid(chainId, address);
    if (!uuid) {
      return { percentage: 0, synced: false };
    }
    const status = await provableScannerService.getSyncStatus(
      uuid,
      networkFromChainId(chainId),
    );
    return status ?? { percentage: 0, synced: false };
  }

  async scannerDeactivateViewConsumer({
    consumerId,
  }: ScannerDeactivateViewConsumerProps): Promise<void> {
    recordSyncService.deactivateViewConsumer(consumerId);
  }

  async getAleoComplianceProof({
    uniqueId,
    programId,
    address,
  }: AleoComplianceProofProps): Promise<string> {
    const instance = this.coinService.getInstance(uniqueId) as AleoService;
    return await instance.getComplianceProof(programId, address);
  }

  async sendAleoTransaction(params: AleoSendTxProps): Promise<void> {
    const { walletId, accountId, coinType, ...rest } = params;
    const pk = await this.keyringManager.getPrivateKey({
      walletId,
      coinType,
      accountId,
    });
    sendAleoTransaction({
      ...rest,
      privateKey: pk,
    }).then(async (resp) => {
      console.log("===> sendAleoTransaction sendTransaction resp: ", resp);
      console.log("===> sendAleoTransaction sendTransaction payload: ", {
        error: resp?.payload?.error,
        data: resp?.payload?.data,
      });

      const error = resp?.payload?.error;
      if (!resp || error) {
        const finalTxInfo: AleoLocalTxInfo = {
          ...params,
          status: AleoTxStatus.FAILED,
          txType: AleoTxType.EXECUTION,
          notification: false,
          error: error ?? "sendTransaction failed",
        };
        const instance = this.coinService.getInstance(
          params.uniqueId,
        ) as AleoService;
        await instance.setAddressLocalTx(rest.address, finalTxInfo);
      }
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

  async resetWallet(): Promise<boolean> {
    try {
      await Promise.all([
        this.accountSettingStorage.removeSelectedAccount(),
        this.keyringManager.resetWallet(),
      ]);
      return true;
    } catch (err) {
      return false;
    }
  }

  async deleteWallet(walletId: string): Promise<DisplayKeyring> {
    try {
      const groupAccount =
        await this.accountSettingStorage.getSelectedGroupAccount();
      let newSelectedAccount: OneMatchGroupAccount | null = null;
      if (groupAccount?.wallet.walletId === walletId) {
        const allWallets = await this.keyringManager.getAllWallet(false);
        if (allWallets) {
          const otherHDWallet = allWallets[WalletType.HD]?.filter(
            (item) => item.walletId !== walletId,
          )[0];
          if (otherHDWallet) {
            const { groupAccounts, ...restWallet } = otherHDWallet;
            if (groupAccounts[0]) {
              newSelectedAccount = {
                wallet: restWallet,
                group: groupAccounts[0],
              };
            }
          } else {
            const otherSimpleWallet = allWallets[WalletType.SIMPLE]?.filter(
              (item) => item.walletId !== walletId,
            )[0];
            if (otherSimpleWallet) {
              const { groupAccounts, ...restWallet } = otherSimpleWallet;
              if (groupAccounts[0]) {
                newSelectedAccount = {
                  wallet: restWallet,
                  group: groupAccounts[0],
                };
              }
            }
          }
        }
        if (newSelectedAccount) {
          await this.accountSettingStorage.setSelectedGroupAccount(
            newSelectedAccount,
          );
        } else {
          await this.accountSettingStorage.removeSelectedAccount();
        }
      }
      await this.keyringManager.deleteWallet(walletId);
    } catch (err) {
      console.error("===> deleteWallet error: ", err);
    }
    return await this.getAllWallet();
  }

  async signMessage(params: PopupSignMessageProps): Promise<string> {
    const { walletId, accountId, coinType, message } = params;
    const pk = await this.getPrivateKey({ walletId, accountId, coinType });
    switch (coinType) {
      case CoinType.ALEO: {
        const messageArray = hexToUint8Array(message);
        const privateKey = PrivateKey.from_string(pk);
        const signature = privateKey.sign(messageArray).to_hex();
        return signature;
      }
      default: {
        throw new Error("Unsupported coinType " + coinType);
      }
    }
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

  async createRequestETHAddChainPopup(params: any, siteMetadata: SiteMetadata) {
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      InnerChainUniqueId.ETHEREUM,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    const request: DappRequest = {
      id: requestId,
      type: "wallet_addEthereumChain",
      coinType: CoinType.ETH,
      siteInfo: siteMetadata.siteInfo,
      address: selectedAccount.account.address,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<any | null>(async (resolve, reject) => {
      try {
        const popup = await createPopup(`/add_ethereum_chain/${requestId}`);
        const popupId = popup.id;
        if (popupId) {
          this.addItem(popupId, requestId);
          this.requestIdCallbackMap[requestId] = async (error, data: any) => {
            try {
              if (error) {
                const popupId = this.findPopupIdByRequestId(requestId);
                if (popupId) {
                  browser.windows.remove(popupId);
                }
                reject(error);
                return;
              }
              await browser.windows.remove(popupId);
              resolve(data);
            } catch (err) {
              console.error(
                "createRequestETHAddChainPopup callback error: ",
                err,
              );
              reject(err);
            }
          };
        } else {
          resolve(null);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async createRequestETHAddTokenPopup(params: any, siteMetadata: SiteMetadata) {
    const { coinType, address, localId } = params;
    const requestId = nanoid();
    const groupAccount = await this.getSelectedGroupAccount();
    if (!groupAccount) {
      throw new Error("No selected account");
    }
    const selectedAccount = matchAccountFromGroupAccount(
      groupAccount,
      InnerChainUniqueId.ETHEREUM,
    );
    if (!selectedAccount) {
      throw new Error("No selected account");
    }
    const request: DappRequest = {
      id: requestId,
      type: "wallet_watchAsset",
      coinType: CoinType.ETH,
      siteInfo: siteMetadata.siteInfo,
      address: selectedAccount.account.address,
      payload: params,
    };
    await this.dappStorage.setDappRequest(request);
    return new Promise<any | null>(async (resolve, reject) => {
      try {
        const popup = await createPopup(`/add_ethereum_token/${requestId}`);
        const popupId = popup.id;
        if (popupId) {
          this.addItem(popupId, requestId);
          this.requestIdCallbackMap[requestId] = async (error, data: any) => {
            try {
              if (error) {
                const popupId = this.findPopupIdByRequestId(requestId);
                if (popupId) {
                  browser.windows.remove(popupId);
                }
                reject(error);
                return;
              }
              await browser.windows.remove(popupId);
              resolve(data);
            } catch (err) {
              console.error(
                "createRequestETHAddTokenPopup callback error: ",
                err,
              );
              reject(err);
            }
          };
        } else {
          resolve(null);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
