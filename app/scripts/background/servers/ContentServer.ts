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
  AleoRequestTxProps,
  AleoRequestDeploymentProps,
} from "./IWalletServer";
import { nanoid } from "nanoid";
import { CoinType } from "core/types";
import { DappStorage } from "../store/dapp/DappStorage";
import { AccountSettingStorage } from "../store/account/AccountStorage";
import { PopupWalletServer } from "./PopupServer";
import { SiteInfo } from "@/scripts/content/host";
import { DAPP_CONNECTION_EXPIRE_TIME } from "@/common/constants";
import { ViewKey, Program } from "aleo_wasm_mainnet";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoLocalHistoryItem } from "core/coins/ALEO/types/History";
import {
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
import { DecryptPermission } from "@/database/types/dapp";
import { matchAccountsWithUnqiueId } from "@/store/accountV2";

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
    const groupAccount =
      await this.accountSettingStorage.getSelectedGroupAccount();
    if (groupAccount) {
      const selectedAccount = matchAccountsWithUnqiueId(
        groupAccount,
        InnerChainUniqueId.ALEO_MAINNET,
      )[0];
      if (selectedAccount) {
        const connectHistorys = await this.dappStorage.getConnectHistory(
          CoinType.ALEO,
          selectedAccount.address,
          params.network,
        );
        const connectHistory = connectHistorys?.find(
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
    await this.dappStorage.disconnect(
      CoinType.ALEO,
      address,
      network,
      siteInfo.origin,
    );
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
      chainId,
    );
    const connectHistory = connectHistorys?.find(
      (item) =>
        item.site?.origin === siteInfo.origin && item.network === chainId,
    );
    if (connectHistory && !connectHistory.disconnected) {
      return connectHistory.decryptPermission;
    }
    return null;
  };

  private checkPermissionExist = async (
    address: string,
    chainId: string,
    siteInfo: SiteInfo,
  ) => {
    const permission = await this.getDecryptPermission(
      address,
      chainId,
      siteInfo,
    );
    if (!permission) {
      throw new Error("No permission");
    }
    return true;
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
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { program, filter } = params;
        const records = await this.coinService
          .getInstance(InnerChainUniqueId.ALEO_MAINNET)
          .getRecords(address, program, filter || RecordFilter.ALL, true);
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

  requestRecordPlaintexts = async (
    params: RequestRecordsProps,
    siteMetadata?: SiteMetadata,
  ): Promise<RequestRecordsPlaintextResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { program, filter } = params;
        const records = await this.coinService
          .getInstance(InnerChainUniqueId.ALEO_MAINNET)
          .getRecords(address, program, filter || RecordFilter.ALL, true);
        const formatRecords = records.map((record) => {
          return {
            id: record.commitment,
            owner: address,
            program_id: record.programId,
            spent: record.spent,
            data: record.content,
            recordName: record.recordName!,
            plaintext: record.plaintext,
          };
        });
        return { records: formatRecords };
      }
      default: {
        throw new Error("Unknown network " + network);
      }
    }
  };

  requestTransaction = async (
    params: RequestTxProps,
    siteMetadata?: SiteMetadata,
  ): Promise<RequestTxResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { transaction } = params;
        const { transitions, fee, feePrivate } = transaction;
        if (transitions.length > 1) {
          throw new Error("Don't support multiple transitions currently");
        }
        if (transitions.length === 0) {
          throw new Error("Empty transitions");
        }

        const { program, functionName, inputs } = transitions[0];

        const isFeeRequired = !(
          program === "credits.aleo" && functionName === "split"
        );

        if (!fee && isFeeRequired) {
          throw new Error("Need base fee");
        }
        if (!program || !functionName) {
          throw new Error("Need programId and functionName");
        }
        if (!program.endsWith(".aleo")) {
          throw new Error("Wrong programId");
        }
        const [{ formatInputs, feeRecord }, priorityFee] = await Promise.all([
          this.coinService
            .getInstance(InnerChainUniqueId.ALEO_MAINNET)
            .formatRequestTransactionInputsAndFee(address, inputs, BigInt(fee)),
          this.coinService
            .getInstance(InnerChainUniqueId.ALEO_MAINNET)
            .getPriorityFee(),
        ]);
        let feeStr: string | null = null;
        if (feePrivate && isFeeRequired) {
          if (!feeRecord) {
            throw new Error("Can't found record to pay fee");
          }
          feeStr = feeRecord.plaintext;
        }
        const localId = nanoid();
        const txParams: AleoRequestTxProps = {
          address,
          localId,
          chainId: network,
          programId: program,
          functionName,
          inputs: formatInputs,
          baseFee: fee.toString(),
          priorityFee: priorityFee.toString(),
          feeRecord: feeStr,
          timestamp: Date.now(),
          uniqueId: InnerChainUniqueId.ALEO_MAINNET,
          coinType: CoinType.ALEO,
          tokenId: NATIVE_TOKEN_TOKEN_ID,
        };
        const transactionId = await this.popupServer.createRequestTxPopup(
          txParams,
          siteInfo,
        );
        if (!transactionId) {
          await this.coinService
            .getInstance(InnerChainUniqueId.ALEO_MAINNET)
            .removeAddressLocalTx(address, localId);
          throw new Error("requestTransaction failed");
        }
        return {
          transactionId,
        };
      }
      default: {
        throw new Error("Unknown network " + network);
      }
    }
  };
  signMessage = async (
    params: SignMessageProps,
    siteMetadata?: SiteMetadata,
  ): Promise<SignMessageResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    const signature = await this.popupServer.creatSignMessagePopup(
      params,
      address,
      siteInfo,
    );
    if (!signature) {
      throw new Error("signMessage failed");
    }
    return {
      signature,
    };
  };
  requestExecution = async (params: RequestTxProps): Promise<RequestTxResp> => {
    return await this.requestTransaction(params);
  };

  requestBulkTransactions = async (
    params: RequestBulkTxsProps,
    siteMetadata?: SiteMetadata,
  ): Promise<RequestBulkTxsResp> => {
    throw new Error("Method not implemented due to security concern.");
  };

  requestDeploy = async (
    params: RequestDeployProps,
    siteMetadata?: SiteMetadata,
  ): Promise<RequestDeployResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { deployment } = params;
        const { program, address, fee, feePrivate } = deployment;

        if (!fee) {
          throw new Error("Need base fee");
        }
        if (!program) {
          throw new Error("Need deployment program");
        }
        const parsedProgram = Program.fromString(program);
        if (!parsedProgram) {
          throw new Error("Wrong program");
        }
        const [priorityFee] = await Promise.all([
          this.coinService
            .getInstance(InnerChainUniqueId.ALEO_MAINNET)
            .getPriorityFee(),
        ]);
        let feeStr: string | null = null;
        if (feePrivate) {
          const records = await this.coinService
            .getInstance(InnerChainUniqueId.ALEO_MAINNET)
            .getRecords(address, NATIVE_TOKEN_PROGRAM_ID, RecordFilter.UNSPENT);
          const feeRecord = records[0];
          if (!feeRecord) {
            throw new Error("Can't found record to pay fee");
          }
          feeStr = feeRecord.plaintext;
        }
        const localId = nanoid();
        const txParams: AleoRequestDeploymentProps = {
          address,
          localId,
          chainId: network,
          program: program,
          programId: parsedProgram.id(),
          baseFee: fee.toString(),
          priorityFee: priorityFee.toString(),
          feeRecord: feeStr,
          timestamp: Date.now(),
          uniqueId: InnerChainUniqueId.ALEO_MAINNET,
          coinType: CoinType.ALEO,
        };
        const transactionId = await this.popupServer.createRequestDeployPopup(
          txParams,
          siteInfo,
        );
        if (!transactionId) {
          await this.coinService
            .getInstance(InnerChainUniqueId.ALEO_MAINNET)
            .removeAddressLocalTx(address, localId);
          throw new Error("requestTransaction failed");
        }
        return {
          transactionId,
        };
      }
      default: {
        throw new Error("Unknown network " + network);
      }
    }
  };

  transactionStatus = async (
    params: TransactionStatusProps,
    siteMetadata?: SiteMetadata,
  ): Promise<TransactionStatusResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { transactionId } = params;
        const tx = await this.coinService
          .getInstance(InnerChainUniqueId.ALEO_MAINNET)
          .getLocalTxInfo(address, transactionId);
        if (!tx) {
          throw new Error("Can't found transaction");
        }
        const { status } = tx;
        return {
          status,
        };
      }
      default: {
        throw new Error("Unknown network " + network);
      }
    }
  };

  getExecution = async (
    params: TransactionStatusProps,
  ): Promise<TransactionStatusResp> => {
    return await this.transactionStatus(params);
  };

  requestTransactionHistory = async (
    params: RequestTxHistoryProps,
    siteMetadata?: SiteMetadata,
  ): Promise<RequestTxHistoryResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { program } = params;
        const txs = await this.coinService
          .getInstance(InnerChainUniqueId.ALEO_MAINNET)
          .getTxHistory(address, {}, program);
        return {
          transactions: txs.map((item, i) => ({
            id: (item as AleoLocalHistoryItem).localId || i.toString(),
            transactionId: item.txId!,
          })),
        };
      }
      default: {
        throw new Error("Unknown network " + network);
      }
    }
  };
}
