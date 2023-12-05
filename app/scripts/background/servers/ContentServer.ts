import { ERROR_CODE } from "@/common/types/error";
import { createPopup, openPopup } from "../helper/popup";
import { AuthManager } from "../store/vault/managers/auth/AuthManager";
import { KeyringManager } from "../store/vault/managers/keyring/KeyringManager";
import {
  DecrtptProps,
  RequestBulkTxsProps,
  RequestBulkTxsResp,
  RequestDeployProps,
  RequestDeployResp,
  RequestRecordsPlaintextResp,
  RequestRecordsProps,
  RequestRecordsResp,
  RequestTxHistoryProps,
  RequestTxHistoryResp,
  RequestTxProps,
  RequestTxResp,
  SignMessageProps,
  SignMessageResp,
  TransactionStatusProps,
  TransactionStatusResp,
  type IContentServer,
  ConnectProps,
  RequestFinfishProps,
} from "./IWalletServer";
import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { DappRequest } from "../types/dapp";
import { nanoid } from "nanoid";
import { getActiveTabHost } from "../helper/host";
import { CoinType } from "core/types";
import { DappStorage } from "../store/dapp/DappStorage";
import { AleoConnectHistory } from "../types/connect";
import { AccountSettingStorage } from "../store/account/AccountStorage";
import browser from "webextension-polyfill";
import { PopupWalletServer } from "./PopupServer";
import { SiteInfo } from "@/scripts/content/host";
import { DAPP_CONNECTION_EXPIRE_TIME } from "@/common/constants";

export class ContentWalletServer implements IContentServer {
  authManager: AuthManager;
  keyringManager: KeyringManager;
  dappStorage: DappStorage;
  accountSettingStorage: AccountSettingStorage;
  popupServer: PopupWalletServer;

  constructor(
    authManager: AuthManager,
    keyringManager: KeyringManager,
    dappStorage: DappStorage,
    accountSettingStorage: AccountSettingStorage,
    popupServer: PopupWalletServer,
  ) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
    this.dappStorage = dappStorage;
    this.accountSettingStorage = accountSettingStorage;
    this.popupServer = popupServer;
  }

  connect = async (
    params: ConnectProps,
    siteInfo?: SiteInfo,
  ): Promise<string | null> => {
    const hasWallet = await this.keyringManager.hasWallet();
    if (!hasWallet) {
      await openPopup("/onboard/home");
      throw new Error(ERROR_CODE.NOT_INIT);
    }
    if (!siteInfo) {
      throw new Error("get origin failed");
    }
    const selectedAccount = await this.accountSettingStorage.getSelectedAccount(
      CoinType.ALEO,
    );
    if (selectedAccount) {
      const connectHistorys = await this.dappStorage.getConnectHistory(
        CoinType.ALEO,
        selectedAccount.address,
      );
      const connectHistory = connectHistorys.find(
        (item) =>
          item.site?.origin === siteInfo.origin &&
          item.network === params.network,
      );
      if (
        connectHistory &&
        !connectHistory.disconnected &&
        Date.now() - connectHistory.lastConnectTime <=
          DAPP_CONNECTION_EXPIRE_TIME
      ) {
        return selectedAccount.address;
      }
    }

    return await this.popupServer.createConnectPopup(params, siteInfo);
  };

  disconnect = async (
    params: { network: string; address: string },
    siteInfo?: SiteInfo,
  ): Promise<boolean> => {
    const { network, address } = params;
    if (!address) {
      throw new Error("Address is null");
    }
    if (!siteInfo) {
      throw new Error("Get origin failed");
    }
    await this.dappStorage.disconnect(CoinType.ALEO, address, network);
    return true;
  };
  decrypt = (params: DecrtptProps): Promise<string> => {};
  requestRecords = (
    params: RequestRecordsProps,
  ): Promise<RequestRecordsResp> => {};
  requestRecordPlaintexts = (
    params: RequestRecordsProps,
  ): Promise<RequestRecordsPlaintextResp> => {};
  requestTransaction = (params: RequestTxProps): Promise<RequestTxResp> => {};
  signMessage = (params: SignMessageProps): Promise<SignMessageResp> => {};
  requestExecution = (params: RequestTxProps): Promise<RequestTxResp> => {};
  requestBulkTransactions = (
    params: RequestBulkTxsProps,
  ): Promise<RequestBulkTxsResp> => {};
  requestDeploy = (
    params: RequestDeployProps,
  ): Promise<RequestDeployResp> => {};
  transactionStatus = (
    params: TransactionStatusProps,
  ): Promise<TransactionStatusResp> => {};
  getExecution = (
    params: TransactionStatusProps,
  ): Promise<TransactionStatusResp> => {};
  requestTransactionHistory = (
    params: RequestTxHistoryProps,
  ): Promise<RequestTxHistoryResp> => {};
}
