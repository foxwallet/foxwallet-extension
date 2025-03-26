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
  ALEOConnectProps,
  RequestFinfishProps,
  SiteMetadata,
  RecordFilter,
  AleoRequestTxProps,
  AleoRequestDeploymentProps,
  ServerMethodContext,
} from "./IWalletServer";
import { nanoid } from "nanoid";
import { CoinType } from "core/types";
import { DappStorage } from "../store/dapp/DappStorage";
import { AccountSettingStorage } from "../store/account/AccountStorage";
import { PopupWalletServer } from "./PopupServer";
import { SiteInfo } from "@/scripts/content/host";
import { DAPP_CONNECTION_EXPIRE_TIME } from "@/common/constants";
import { ViewKey, Program } from "aleo_wasm";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoLocalHistoryItem } from "core/coins/ALEO/types/History";
import {
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
import { DecryptPermission } from "@/database/types/dapp";
import { matchAccountsWithUniqueId } from "@/store/accountV2";
import { AleoService } from "core/coins/ALEO/service/AleoService";
import { SerializableError } from "@/scripts/content/ErrorCode";

//TODO Error code for aleo provider
export class ALEOContentWalletServer implements IContentServer<CoinType.ALEO> {
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
    params: ALEOConnectProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<string | null> => {
    const hasWallet = await this.keyringManager.hasWallet();
    if (!hasWallet) {
      await openPopup("/onboard/home");
      throw new SerializableError(ERROR_CODE.NOT_INIT);
    }
    if (!siteMetadata || !siteMetadata.siteInfo) {
      throw new SerializableError("get origin failed");
    }
    const { siteInfo } = siteMetadata;
    const groupAccount =
      await this.accountSettingStorage.getSelectedGroupAccount();
    if (groupAccount) {
      const selectedAccount = matchAccountsWithUniqueId(
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

    try {
      return await this.popupServer.createALEOConnectPopup(params, siteInfo);
    } catch (e) {
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new SerializableError("User rejected the request.");
        } else {
          throw new SerializableError(message);
        }
      }
      throw new SerializableError(e?.toString() ?? "Error");
    }
  };

  disconnect = async (
    params: {},
    { siteMetadata }: ServerMethodContext,
  ): Promise<boolean> => {
    if (!siteMetadata) {
      throw new SerializableError("Metadata is " + siteMetadata);
    }
    const { address, network, siteInfo } = siteMetadata;
    if (!siteInfo) {
      throw new SerializableError("Get origin failed");
    }
    if (!network) {
      throw new SerializableError("Network is null");
    }
    if (!address) {
      throw new SerializableError("Address is null");
    }
    try {
      await this.dappStorage.disconnect(
        CoinType.ALEO,
        address,
        network,
        siteInfo.origin,
      );
      return true;
    } catch (e) {
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        throw new SerializableError("internal error");
      }
      throw new SerializableError(e?.toString() ?? "Error");
    }
  };

  private checkSiteMetadata = (siteMetadata?: SiteMetadata) => {
    if (!siteMetadata) {
      throw new SerializableError("Site metadata is null");
    }
    const { siteInfo, address, network } = siteMetadata;
    if (!siteInfo) {
      throw new SerializableError("Get origin failed");
    }
    if (!address) {
      throw new SerializableError("Address is null");
    }
    if (!network) {
      throw new SerializableError("ChainId is null");
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
      return connectHistory?.decryptPermission ?? null;
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
      throw new SerializableError("No permission");
    }
    return true;
  };

  decrypt = async (
    params: DecrtptProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<string> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    const permission = await this.getDecryptPermission(
      address,
      network,
      siteInfo,
    );
    switch (permission) {
      case DecryptPermission.NoDecrypt: {
        throw new SerializableError("No decrypt permission");
      }
      case DecryptPermission.UponRequest:
      case DecryptPermission.AutoDecrypt:
      case DecryptPermission.OnChainHistory: {
        const { cipherText } = params;
        if (!cipherText) {
          throw new SerializableError("CipherText is null");
        }
        const vkStr = await this.keyringManager.getViewKey({
          coinType: CoinType.ALEO,
          address,
        });
        if (!vkStr) {
          throw new SerializableError("Can't found ViewKey for " + address);
        }
        const viewKey = ViewKey.from_string(vkStr);
        const plainText = viewKey.decrypt(cipherText);
        return plainText;
      }
      default: {
        throw new SerializableError("Unknown decrypt permission " + permission);
      }
    }
  };

  requestRecords = async (
    params: RequestRecordsProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<RequestRecordsResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { program, filter } = params;
        const records = await (
          this.coinService.getInstance(
            InnerChainUniqueId.ALEO_MAINNET,
          ) as AleoService
        ).getRecords(address, program, filter || RecordFilter.ALL, true);
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
        throw new SerializableError("Unknown network " + network);
      }
    }
  };

  requestRecordPlaintexts = async (
    params: RequestRecordsProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<RequestRecordsPlaintextResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { program, filter } = params;
        const records = await (
          this.coinService.getInstance(
            InnerChainUniqueId.ALEO_MAINNET,
          ) as AleoService
        ).getRecords(address, program, filter || RecordFilter.ALL, true);
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
        throw new SerializableError("Unknown network " + network);
      }
    }
  };

  requestTransaction = async (
    params: RequestTxProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<RequestTxResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { transaction } = params;
        const { transitions, fee, feePrivate } = transaction;
        if (transitions.length > 1) {
          throw new SerializableError(
            "Don't support multiple transitions currently",
          );
        }
        if (transitions.length === 0) {
          throw new SerializableError("Empty transitions");
        }

        const { program, functionName, inputs } = transitions[0];

        const isFeeRequired = !(
          program === "credits.aleo" && functionName === "split"
        );

        if (!fee && isFeeRequired) {
          throw new SerializableError("Need base fee");
        }
        if (!program || !functionName) {
          throw new SerializableError("Need programId and functionName");
        }
        if (!program.endsWith(".aleo")) {
          throw new SerializableError("Wrong programId");
        }
        const instance = this.coinService.getInstance(
          InnerChainUniqueId.ALEO_MAINNET,
        ) as AleoService;
        const [{ formatInputs, feeRecord }, priorityFee] = await Promise.all([
          instance.formatRequestTransactionInputsAndFee(
            address,
            inputs,
            BigInt(fee),
          ),
          instance.getPriorityFee(),
        ]);
        let feeStr: string | null = null;
        if (feePrivate && isFeeRequired) {
          if (!feeRecord) {
            throw new SerializableError("Can't found record to pay fee");
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
        const transactionId = await this.popupServer.createRequestAleoTxPopup(
          txParams,
          siteInfo,
        );
        if (!transactionId) {
          await instance.removeAddressLocalTx(address, localId);
          throw new SerializableError("requestTransaction failed");
        }
        return {
          transactionId,
        };
      }
      default: {
        throw new SerializableError("Unknown network " + network);
      }
    }
  };
  signMessage = async (
    params: SignMessageProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<SignMessageResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    const signature = await this.popupServer.createAleoSignMessagePopup(
      params,
      address,
      siteInfo,
    );
    if (!signature) {
      throw new SerializableError("signMessage failed");
    }
    return {
      signature,
    };
  };
  requestExecution = async (
    params: RequestTxProps,
    serverMethodContext: ServerMethodContext,
  ): Promise<RequestTxResp> => {
    return await this.requestTransaction(params, serverMethodContext);
  };

  requestBulkTransactions = async (
    params: RequestBulkTxsProps,
    serverMethodContext: ServerMethodContext,
  ): Promise<RequestBulkTxsResp> => {
    throw new SerializableError(
      "Method not implemented due to security concern.",
    );
  };

  requestDeploy = async (
    params: RequestDeployProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<RequestDeployResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { deployment } = params;
        const { program, address, fee, feePrivate } = deployment;

        if (!fee) {
          throw new SerializableError("Need base fee");
        }
        if (!program) {
          throw new SerializableError("Need deployment program");
        }
        const parsedProgram = Program.fromString(program);
        if (!parsedProgram) {
          throw new SerializableError("Wrong program");
        }
        const instance = this.coinService.getInstance(
          InnerChainUniqueId.ALEO_MAINNET,
        ) as AleoService;
        const [priorityFee] = await Promise.all([instance.getPriorityFee()]);
        let feeStr: string | null = null;
        if (feePrivate) {
          const records = await instance.getRecords(
            address,
            NATIVE_TOKEN_PROGRAM_ID,
            RecordFilter.UNSPENT,
          );
          const feeRecord = records[0];
          if (!feeRecord) {
            throw new SerializableError("Can't found record to pay fee");
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
          await instance.removeAddressLocalTx(address, localId);
          throw new SerializableError("requestTransaction failed");
        }
        return {
          transactionId,
        };
      }
      default: {
        throw new SerializableError("Unknown network " + network);
      }
    }
  };

  transactionStatus = async (
    params: TransactionStatusProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<TransactionStatusResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { transactionId } = params;
        const instance = this.coinService.getInstance(
          InnerChainUniqueId.ALEO_MAINNET,
        ) as AleoService;
        const tx = await instance.getLocalTxInfo(address, transactionId);
        if (!tx) {
          throw new SerializableError("Can't found transaction");
        }
        const { status } = tx;
        return {
          status,
        };
      }
      default: {
        throw new SerializableError("Unknown network " + network);
      }
    }
  };

  getExecution = async (
    params: TransactionStatusProps,
    serverMethodContext: ServerMethodContext,
  ): Promise<TransactionStatusResp> => {
    return await this.transactionStatus(params, serverMethodContext);
  };

  requestTransactionHistory = async (
    params: RequestTxHistoryProps,
    { siteMetadata }: ServerMethodContext,
  ): Promise<RequestTxHistoryResp> => {
    const { address, network, siteInfo } = this.checkSiteMetadata(siteMetadata);
    await this.checkPermissionExist(address, network, siteInfo);
    switch (network) {
      case "mainnet": {
        const { program } = params;
        const instance = this.coinService.getInstance(
          InnerChainUniqueId.ALEO_MAINNET,
        ) as AleoService;
        const txs = await instance.getTxHistory(address, {}, program);
        return {
          transactions: txs.map((item, i) => ({
            id: (item as AleoLocalHistoryItem).localId || i.toString(),
            transactionId: item.txId!,
          })),
        };
      }
      default: {
        throw new SerializableError("Unknown network " + network);
      }
    }
  };
}
