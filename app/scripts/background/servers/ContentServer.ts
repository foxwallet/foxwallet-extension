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
  SiteMetadata,
  RecordFilter,
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
import { DecryptPermission } from "../types/permission";
import { ViewKey } from "aleo_wasm";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

export class ContentWalletServer implements IContentServer {
  authManager: AuthManager;
  keyringManager: KeyringManager;
  dappStorage: DappStorage;
  accountSettingStorage: AccountSettingStorage;
  popupServer: PopupWalletServer;
  coinService: CoinServiceEntry;

  constructor(
    authManager: AuthManager,
    keyringManager: KeyringManager,
    dappStorage: DappStorage,
    accountSettingStorage: AccountSettingStorage,
    popupServer: PopupWalletServer,
    coinService: CoinServiceEntry,
  ) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
    this.dappStorage = dappStorage;
    this.accountSettingStorage = accountSettingStorage;
    this.popupServer = popupServer;
    this.coinService = coinService;
  }

  connect = async (
    params: ConnectProps,
    siteMetadata?: SiteMetadata,
  ): Promise<string | null> => {
    const hasWallet = await this.keyringManager.hasWallet();
    if (!hasWallet) {
      await openPopup("/onboard/home");
      throw new Error(ERROR_CODE.NOT_INIT);
    }
    if (!siteMetadata || !siteMetadata.siteInfo) {
      throw new Error("get origin failed");
    }
    const { siteInfo } = siteMetadata;
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
    params: {},
    siteMetadata?: SiteMetadata,
  ): Promise<boolean> => {
    if (!siteMetadata) {
      throw new Error("Metadata is " + siteMetadata);
    }
    const { address, network, siteInfo } = siteMetadata;
    if (!siteInfo) {
      throw new Error("Get origin failed");
    }
    if (!network) {
      throw new Error("Network is null");
    }
    if (!address) {
      throw new Error("Address is null");
    }
    await this.dappStorage.disconnect(CoinType.ALEO, address, network);
    return true;
  };

  private checkSiteMetadata = (siteMetadata?: SiteMetadata) => {
    if (!siteMetadata) {
      throw new Error("Site metadata is null");
    }
    const { siteInfo, address, network } = siteMetadata;
    if (!siteInfo) {
      throw new Error("Get origin failed");
    }
    if (!address) {
      throw new Error("Address is null");
    }
    if (!network) {
      throw new Error("ChainId is null");
    }

    return { siteInfo, address, network };
  };

  private getDecryptPermission = async (
    address: string,
    chainId: string,
    siteInfo: SiteInfo,
  ): Promise<DecryptPermission | null> => {
    const connectHistorys = await this.dappStorage.getConnectHistory(
      CoinType.ALEO,
      address,
    );
    const connectHistory = connectHistorys.find(
      (item) =>
        item.site?.origin === siteInfo.origin && item.network === chainId,
    );
    if (connectHistory && !connectHistory.disconnected) {
      return connectHistory.decryptPermission;
    }
    return null;
  };

  decrypt = async (
    params: DecrtptProps,
    siteMetadata?: SiteMetadata,
  ): Promise<string> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    const permission = await this.getDecryptPermission(
      address,
      network,
      siteInfo,
    );
    switch (permission) {
      case DecryptPermission.NoDecrypt: {
        throw new Error("No decrypt permission");
      }
      case DecryptPermission.UponRequest:
      case DecryptPermission.AutoDecrypt:
      case DecryptPermission.OnChainHistory: {
        const { cipherText } = params;
        if (!cipherText) {
          throw new Error("CipherText is null");
        }
        const vkStr = await this.keyringManager.getViewKey({
          coinType: CoinType.ALEO,
          address,
        });
        if (!vkStr) {
          throw new Error("Can't found ViewKey for " + address);
        }
        const viewKey = ViewKey.from_string(vkStr);
        const plainText = viewKey.decrypt(cipherText);
        return plainText;
      }
      default: {
        throw new Error("Unknown decrypt permission " + permission);
      }
    }
  };

  requestRecords = async (
    params: RequestRecordsProps,
    siteMetadata?: SiteMetadata,
  ): Promise<RequestRecordsResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.getDecryptPermission(address, network, siteInfo);
    switch (network) {
      case "testnet3": {
        const { program, filter } = params;
        const records = await this.coinService
          .getInstance(InnerChainUniqueId.ALEO_TESTNET_3)
          .getRecords(address, program, filter || RecordFilter.ALL);
        const formatRecords = records.map((record) => {
          return {
            id: record.commitment,
            owner: address,
            program_id: record.programId,
            spent: record.spent,
            data: record.content,
            recordName: record.recordName!,
          };
        });
        return { records: formatRecords };
      }
      default: {
        throw new Error("Unknown network " + network);
      }
    }
  };
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
