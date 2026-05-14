import { AuthManager } from "@/scripts/background/store/vault/managers/auth/AuthManager";
import { KeyringManager } from "@/scripts/background/store/vault/managers/keyring/KeyringManager";
import { DappStorage } from "@/scripts/background/store/dapp/DappStorage";
import { AccountSettingStorage } from "@/scripts/background/store/account/AccountStorage";
import { PopupWalletServer } from "@/scripts/background/servers/PopupServer";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import {
  ETHRequestParams,
  type IContentServer,
  ServerMethodContext,
  SiteMetadata,
} from "@/scripts/background/servers/IWalletServer";
import { CoinType } from "core/types";
import { logger } from "@/common/utils/logger";
import { openPopup } from "@/scripts/background/helper/popup";
import { ERROR_CODE } from "@/common/types/error";
import { matchAccountsWithUniqueId } from "@/store/accountV2";
import { DAPP_CONNECTION_EXPIRE_TIME } from "@/common/constants";
import { getDefaultChainUniqueId } from "core/constants/chain";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import RPCServer from "@/scripts/background/servers/RPCServer";
import { nanoid } from "nanoid";
import { Utils } from "@/scripts/content/utils";
import {
  SignTypedDataVersion,
  TypedDataUtils,
  typedSignatureHash,
} from "@metamask/eth-sig-util";
import * as ethUtils from "ethereumjs-util";
import { addHexPrefix, toBuffer } from "ethereumjs-util";
import { parseEthChainId, stripHexPrefix } from "core/coins/ETH/utils";
import { errorCodes, ProviderError } from "@/scripts/content/ErrorCode";
import { BigNumber } from "ethers";
import { GasFeeEIP1559, GasFeeLegacy, GasFeeType } from "core/types/GasFee";
import { contentServerHandler } from "@/scripts/background";
import { v4 as uuidv4 } from "uuid";
import { FullModel } from "@/store/store";
import { getStorageData, setStorageData } from "@/common/utils/storage";
import { ChainBaseConfig } from "core/types/ChainBaseConfig";
import { getChainConfigsByFilter } from "@/hooks/useGroupAccount";
import { RematchRootState } from "@rematch/core";
import { RootModel } from "@/store";
import { appStorageInstance } from "@/common/utils/indexeddb";
import { QtumService } from "core/coins/QTUM/service/QtumService";
import { QtumConfig } from "core/coins/QTUM/types/QtumConfig";
import {
  decodeEvmAddress,
  getEvmAddress,
  getQtumChainId,
} from "core/coins/QTUM/utils/address";
import { QTUMNetwork } from "core/coins/QTUM/types/QTUMAccount";
import { hashMessage, recoverAddress } from "qtum-ethers-wrapper";

export type SIGN_LEGACY_TX_PAYLOAD = {
  type: string;
  value: string;
  from: string;
  to: string;
  data?: string;
  gas: string;
  gasPrice: string;
  gasLimit?: string;
};

export type WATCH_ASSET_PAYLOAD = {
  contract: string;
  symbol?: string;
  decimals?: number;
  image?: string;
};

export type SIGN_EIP11559_TX_PAYLOAD = {
  type?: string;
  value: string;
  from: string;
  to: string;
  data?: string;
  gasLimit: string;
  gas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

export type QtumDappAddress = {
  evmAddress: string;
  qtumAddress: string;
}

export type TypedMessageV1 = Array<{
  type: string;
  name: string;
  value: string;
}>;

export class QTUMContentWalletServer implements IContentServer<CoinType.QTUM> {
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

  emitEvent = (event: "chainChanged" | "networkChanged", data: any) => {
    contentServerHandler.emitToDapps({
      type: "EmitData",
      data,
      coinType: CoinType.QTUM,
      event,
    });
  };

  private checkSiteMetadata = (siteMetadata?: SiteMetadata) => {
    if (!siteMetadata) {
      throw new Error("Site metadata is null");
    }
    const { siteInfo, address } = siteMetadata;
    if (!siteInfo) {
      throw new Error("Get origin failed");
    }
    if (!address) {
      throw new Error("Address is null");
    }
    return { siteInfo, address };
  };

  getChainInfo(network: string | null | undefined) {
    let chainUniqueId = getDefaultChainUniqueId(CoinType.QTUM, {});
    let qNetwork = QTUMNetwork.qtum;
    if (network) {
      switch (network) {
        case "0x51":
          qNetwork = QTUMNetwork.qtum;
          chainUniqueId = InnerChainUniqueId.QTUM;
          break;
        case "0x22B9":
          qNetwork = QTUMNetwork.qtumTestnet;
          chainUniqueId = InnerChainUniqueId.QTUM_TESTNET;
          break;
      }
    }
    return { chainUniqueId, qNetwork };
  }

  eth_accounts = async (
    payload: {},
    { siteMetadata }: ServerMethodContext,
  ): Promise<QtumDappAddress[]> => {
    logger.log("ethAccounts", payload);
    const hasWallet = await this.keyringManager.hasWallet();
    if (!hasWallet) {
      await openPopup("/onboard/home");
      throw new ProviderError(errorCodes.rpc.internal, ERROR_CODE.NOT_INIT);
    }
    if (!siteMetadata || !siteMetadata.siteInfo) {
      throw new ProviderError(errorCodes.rpc.internal, "get origin failed");
    }
    try {
      const { siteInfo, network } = siteMetadata;
      const groupAccount =
        await this.accountSettingStorage.getSelectedGroupAccount();
      if (groupAccount) {
        const selectedAccount = matchAccountsWithUniqueId(
          groupAccount,
          this.getChainInfo(network).chainUniqueId,
        )[0];
        if (selectedAccount) {
          const connectHistorys = await this.dappStorage.getConnectHistory(
            CoinType.QTUM,
            selectedAccount.address,
            "", //no chainId at connect
          );
          const connectHistory = connectHistorys?.find(
            (item) => item.site?.origin === siteInfo.origin,
          );
          if (connectHistory && !connectHistory.disconnected) {
            if (
              Date.now() - connectHistory.lastConnectTime <=
              DAPP_CONNECTION_EXPIRE_TIME
            ) {
              return [
                {
                  qtumAddress: selectedAccount.address,
                  evmAddress: getEvmAddress(selectedAccount.address),
                } satisfies QtumDappAddress,
              ];
            } else {
              void this.dappStorage.disconnect(
                CoinType.QTUM,
                selectedAccount.address,
                "",
                siteInfo.origin,
              );
              return [];
            }
          }
        }
      }
      return [];
    } catch (e) {
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw new ProviderError(
        errorCodes.rpc.internal,
        e?.toString() ?? "Error",
      );
    }
  };

  eth_requestAccounts = async (
    payload: {},
    context: ServerMethodContext,
  ): Promise<QtumDappAddress[]> => {
    logger.log("requestAccounts", payload);
    const connectedAddress = await this.eth_accounts(payload, context);
    if (connectedAddress.length > 0) {
      return connectedAddress;
    }
    const { siteInfo, network } = context.siteMetadata!;
    try {
      const address = await this.popupServer.createConnectPopup(
        {
          ...(network ? { network } : {}),
          coinType: CoinType.QTUM,
        },
        siteInfo,
      );
      return address
        ? [{ qtumAddress: address, evmAddress: getEvmAddress(address) }]
        : [];
    } catch (e) {
      logger.error("eth_requestAccounts", e);
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            message,
          );
        }
      }
      throw new ProviderError(
        errorCodes.rpc.internal,
        e?.toString() ?? "Error",
      );
    }
  };

  wallet_getPermissions = async (
    payload: ETHRequestParams<{}>,
    context: ServerMethodContext,
  ) => {
    logger.log("walletGetPermissions", payload);
    const connectedAddress = await this.eth_accounts(payload, context);
    console.log("connectedAddress", connectedAddress);
    if (!connectedAddress[0]) {
      return [];
    }
    const { siteInfo } = context.siteMetadata!;
    const id = payload.id?.toString() ?? nanoid();
    return [
      {
        id,
        parentCapability: "eth_accounts",
        invoker: siteInfo.origin,
        caveats: [
          {
            type: "restrictReturnedAccounts",
            value: [connectedAddress[0].evmAddress],
          },
        ],
        date: +Date.now(),
      },
    ];
  };
  wallet_requestPermissions = async (
    payload: ETHRequestParams<[{ eth_accounts: {} }]>,
    context: ServerMethodContext,
  ) => {
    try {
      logger.log("walletRequestPermissions", payload);
      if (!context.siteMetadata || !context.siteMetadata.siteInfo) {
        throw new ProviderError(errorCodes.rpc.internal, "get origin failed");
      }
      const { siteInfo, network } = context.siteMetadata!;
      const address = await this.popupServer.createConnectPopup(
        {
          ...(network ? { network } : {}),
          coinType: CoinType.QTUM,
        },
        siteInfo,
      );
      if (!address) {
        throw new ProviderError(
          errorCodes.provider.userRejectedRequest,
          "User rejected the request.",
        );
      }
      const id = payload.id?.toString() ?? nanoid();
      const result = Object.keys(payload.params[0]).map((permissionName) => {
        if (permissionName === "eth_accounts") {
          return {
            id,
            parentCapability: "eth_accounts",
            invoker: siteInfo.origin,
            caveats: [
              {
                type: "restrictReturnedAccounts",
                value: [getEvmAddress(address)],
              },
            ],
            date: +Date.now(),
          };
        }
        return {
          caveats: [],
          date: Date.now(),
          id,
          invoker: siteInfo.origin,
          parentCapability: permissionName,
        };
      });
      return result;
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw new ProviderError(
        errorCodes.rpc.internal,
        e?.toString() ?? "Error",
      );
    }
  };

  wallet_revokePermissions = async (
    payload: ETHRequestParams<[{ eth_accounts: {} }]>,
    context: ServerMethodContext,
  ) => {
    try {
      const connectedAddress = await this.eth_accounts(payload, context);
      if (!connectedAddress[0]) {
        return null;
      }
      const { siteInfo } = context.siteMetadata!;
      if (!payload.params[0].eth_accounts) {
        return null;
      }
      await this.dappStorage.disconnect(
        CoinType.QTUM,
        connectedAddress[0].qtumAddress,
        "",
        siteInfo.origin,
      );
      return null;
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw new ProviderError(
        errorCodes.rpc.internal,
        e?.toString() ?? "Error",
      );
    }
  };

  autoFixPersonalSignMessage({ message }: { message: string }) {
    let messageFixed = message;
    try {
      ethUtils.toBuffer(message);
    } catch (error) {
      const tmpMsg = `0x${message}`;
      try {
        ethUtils.toBuffer(tmpMsg);
        messageFixed = tmpMsg;
      } catch (err) {
        // message not including valid hex character
      }
    }
    return messageFixed;
  }

  personal_sign = async (
    payload: ETHRequestParams<[string, string]>,
    context: ServerMethodContext,
  ) => {
    if (!context.siteMetadata || !context.siteMetadata.siteInfo) {
      throw new ProviderError(errorCodes.rpc.internal, "get origin failed");
    }
    try {
      let network = context.siteMetadata.network;
      const { qNetwork, chainUniqueId } = this.getChainInfo(network);
      const [p1, p2] = payload.params;
      let message = p1;
      let address = p2;
      if (Utils.resemblesAddress(p1) && !Utils.resemblesAddress(p2)) {
        address = p1;
        message = p2;
      }
      message = this.autoFixPersonalSignMessage({ message });
      const agreed = await this.popupServer.createSignMessagePopup(
        {
          message,
        },
        address,
        CoinType.QTUM,
        context.siteMetadata!,
      );
      if (!agreed) {
        throw new ProviderError(
          errorCodes.provider.userRejectedRequest,
          "User rejected the request.",
        );
      }
      const instance = this.coinService.getInstance(
        chainUniqueId,
      ) as QtumService;
      let realAddress: string = decodeEvmAddress(
        address,
        getQtumChainId(qNetwork),
      );
      const pk = await this.keyringManager.getPrivateKeyByAddress({
        coinType: CoinType.QTUM,
        address: realAddress,
      });
      const signWallet = instance.getSignWallet(pk, address);
      const msg = message.startsWith("0x")
        ? Buffer.from(stripHexPrefix(message), "hex")
        : message;
      const result = await signWallet.signMessage(msg);
      return `${addHexPrefix(Buffer.from(result).toString("hex"))}`;
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw new ProviderError(
        errorCodes.rpc.internal,
        e?.toString() ?? "Error",
      );
    }
  };

  personal_ecRecover = async (
    payload: ETHRequestParams<[string, string]>,
    serverMethodContext: ServerMethodContext,
  ) => {
    try {
      const [message, signature] = payload.params;
      if (message && signature) {
        const msg = hashMessage(message);
        const addr = recoverAddress(msg, signature);
        return addr.toLowerCase();
      }
    } catch (e) {
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        throw new ProviderError(errorCodes.rpc.internal, message);
      }
      throw new ProviderError(
        errorCodes.rpc.internal,
        e?.toString() ?? "Error",
      );
    }
  };

  eth_signTypedData_v3 = async (
    payload: ETHRequestParams<[any, string]>,
    serverMethodContext: ServerMethodContext,
  ) => {
    return this._ethSignTypedData(payload, serverMethodContext);
  };

  eth_signTypedData_v4 = async (
    payload: ETHRequestParams<[any, string]>,
    serverMethodContext: ServerMethodContext,
  ) => {
    return this._ethSignTypedData(payload, serverMethodContext);
  };

  eth_signTypedData = async (
    payload: ETHRequestParams<[any, string]>,
    serverMethodContext: ServerMethodContext,
  ) => {
    return this._ethSignTypedData(payload, serverMethodContext);
  };
  _ethSignTypedData = async (
    payload: ETHRequestParams<[any, string]>,
    serverMethodContext: ServerMethodContext,
  ) => {
    try {
      const [p1, p2] = payload.params;
      let data: any = p1;
      let address = p2;
      if (Utils.resemblesAddress(p1) && !Utils.resemblesAddress(p2)) {
        address = p1;
        data = p2;
      }
      const message = typeof data === "string" ? JSON.parse(data) : data;
      const { chainId } = message.domain || {};
      // const currentChainId = await this.net_version({}, serverMethodContext);
      let currentNetwork = serverMethodContext.siteMetadata?.network;
      if (currentNetwork) {
        const { valid, chainId: currentChainId } =
          parseEthChainId(currentNetwork);
        if (
          valid &&
          !!currentNetwork &&
          !!chainId &&
          !isNaN(chainId) &&
          Number(chainId) !== Number(currentChainId)
        ) {
          throw new ProviderError(
            errorCodes.rpc.invalidParams,
            "Provided chainId does not match the currently active chain",
          );
        }
      }
      const { qNetwork, chainUniqueId } = this.getChainInfo(currentNetwork);
      let version = SignTypedDataVersion.V1;
      switch (payload.method) {
        case "eth_signTypedData_v3":
          version = SignTypedDataVersion.V3;
          break;
        case "eth_signTypedData_v4":
          version = SignTypedDataVersion.V4;
          break;
        case "eth_signTypedData":
          version = SignTypedDataVersion.V1;
          break;
      }
      const hash =
        version !== SignTypedDataVersion.V1
          ? TypedDataUtils.eip712Hash(message, version)
          : "";

      let toSign = {
        data: "0x" + hash.toString("hex"),
        raw: typeof data === "string" ? data : JSON.stringify(data),
        address,
        version,
      };
      console.log("payload", payload);
      const agreed = await this.popupServer.createSignMessagePopup(
        {
          message,
          method: payload.method,
        },
        address,
        CoinType.QTUM,
        serverMethodContext.siteMetadata!,
      );
      if (!agreed) {
        throw new ProviderError(
          errorCodes.provider.userRejectedRequest,
          "User rejected the request.",
        );
      }
      console.log("_ethSignTypedData", toSign);
      let realAddress: string = decodeEvmAddress(
        address,
        getQtumChainId(qNetwork),
      );
      const pk = await this.keyringManager.getPrivateKeyByAddress({
        coinType: CoinType.QTUM,
        address: realAddress,
      });
      const instance = this.coinService.getInstance(
        chainUniqueId,
      ) as QtumService;

      const signWallet = instance.getSignWallet(pk, address);

      switch (version) {
        case SignTypedDataVersion.V1: {
          const hash = toBuffer(
            typedSignatureHash(JSON.parse(toSign.raw) as TypedMessageV1),
          );
          const result = (await signWallet.signHash(hash)) as unknown as Buffer;
          return `${addHexPrefix(Buffer.from(result).toString("hex"))}`;
        }
        case SignTypedDataVersion.V3:
        case SignTypedDataVersion.V4: {
          console.log("EthereumMethod.SIGN_TYPED_MESSAGE_V4", message);
          const typedData = JSON.parse(toSign.raw);
          const types = Object.assign({}, typedData.types);
          delete types.EIP712Domain;
          // sign v3 typed message
          const result = (await signWallet._signTypedData(
            typedData.domain,
            types,
            typedData.message,
          )) as unknown as Buffer;
          return `${addHexPrefix(Buffer.from(result).toString("hex"))}`;
        }
      }
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw new ProviderError(
        errorCodes.rpc.internal,
        e?.toString() ?? "Error",
      );
    }
  };

  eth_sendTransaction = async (
    _payload: ETHRequestParams<[any]>,
    { siteMetadata }: ServerMethodContext,
  ) => {
    console.log("eth_sendTransaction", _payload, siteMetadata);
    try {
      const payload: SIGN_EIP11559_TX_PAYLOAD | SIGN_LEGACY_TX_PAYLOAD =
        _payload.params[0];
      const { siteInfo } = siteMetadata!;
      if (!payload || !payload.from) {
        throw new ProviderError(
          errorCodes.rpc.invalidParams,
          "Invalid payload",
        );
      }
      const { from, to, data } = payload;
      const value = payload.value
        ? BigNumber.from(payload.value).toBigInt()
        : 0n;
      const gasLimit = Number(payload.gas || payload.gasLimit || "0");
      // By default we use EIP1559
      const type =
        Number(payload.type || "2") === 2
          ? GasFeeType.EIP1559
          : GasFeeType.LEGACY;
      const gasPrice = (payload as SIGN_LEGACY_TX_PAYLOAD).gasPrice;
      const maxFeePerGas = (payload as SIGN_EIP11559_TX_PAYLOAD).maxFeePerGas;
      const maxPriorityFeePerGas = (payload as SIGN_EIP11559_TX_PAYLOAD)
        .maxPriorityFeePerGas;
      const formatGasPrice = gasPrice ? BigNumber.from(gasPrice) : undefined;
      const formatMaxFeePerGas =
        maxFeePerGas && maxPriorityFeePerGas
          ? BigNumber.from(maxFeePerGas)
          : undefined;
      const formatMaxPriorityFeePerGas =
        maxFeePerGas && maxPriorityFeePerGas
          ? BigNumber.from(maxPriorityFeePerGas)
          : undefined;
      let estimateGas = BigNumber.from(0);
      if (type === GasFeeType.LEGACY && formatGasPrice && gasLimit) {
        estimateGas = formatGasPrice.mul(gasLimit);
      } else if (
        type === GasFeeType.EIP1559 &&
        formatMaxFeePerGas &&
        formatMaxPriorityFeePerGas &&
        gasLimit
      ) {
        estimateGas = formatMaxFeePerGas.mul(gasLimit);
      }

      const currUniqueId = await this.getUniqueIdForSite(siteMetadata, true);

      const txid = await this.popupServer.createRequestTxPopup(
        {
          uniqueId: currUniqueId,
          coinType: CoinType.QTUM,
          from,
          to,
          value,
          data,
          replaceGasFeeData: {
            type,
            gasLimit: gasLimit,
            gasPrice: formatGasPrice?.toBigInt(),
            maxFeePerGas: formatMaxFeePerGas?.toBigInt(),
            maxPriorityFeePerGas: formatMaxPriorityFeePerGas?.toBigInt(),
            estimateGas: estimateGas.toBigInt(),
          } as GasFeeEIP1559 | GasFeeLegacy,
        },
        siteInfo,
      );
      return txid;
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw e;
    }
  };

  wallet_watchAsset = async (
    payload: ETHRequestParams<any>,
    serverMethodContext: ServerMethodContext,
  ) => {
    try {
      const connectedAddress = await this.eth_accounts(
        payload,
        serverMethodContext,
      );
      if (!connectedAddress[0]) {
        throw new ProviderError(
          errorCodes.rpc.internal,
          "no connected address",
        );
      }
      const { siteMetadata } = serverMethodContext;
      if (!siteMetadata) {
        throw new ProviderError(errorCodes.rpc.internal, "no site info");
      }
      const network = siteMetadata.network;
      const groupAccount =
        await this.accountSettingStorage.getSelectedGroupAccount();
      if (!groupAccount) {
        throw new ProviderError(errorCodes.rpc.internal, "no group account");
      }
      const selectedAccount = matchAccountsWithUniqueId(
        groupAccount,
        this.getChainInfo(network).chainUniqueId,
      )[0];
      if (selectedAccount.address !== connectedAddress[0].qtumAddress) {
        throw new ProviderError(
          errorCodes.rpc.internal,
          "no connected address",
        );
      }
      let options = payload.params.options;

      const token = {
        type: payload.params.type,
        contract: options.address,
        symbol: options.symbol,
        decimals: options.decimals || 0,
        image: options.image || "",
      };

      console.log("payload", payload);
      console.log("siteMetadata", siteMetadata);

      const chainIdRequest = parseEthChainId(network || "0x51");

      const state = (await appStorageInstance.getItem(
        "persist:root",
      )) as RematchRootState<RootModel, FullModel>;

      const existChainConfigs = getChainConfigsByFilter({
        state,
        filter: (item: ChainBaseConfig) =>
          item.coinType === CoinType.QTUM &&
          (item as QtumConfig).chainId === chainIdRequest.chainId.toString(),
      });

      if (existChainConfigs.length === 0) {
        throw new ProviderError(
          errorCodes.rpc.invalidParams,
          "no matching chain",
        );
      }

      const { uniqueId } = existChainConfigs[0];
      const instance = this.coinService.getInstance(uniqueId) as QtumService;

      if (
        !instance.validateAddress(token.contract) ||
        !instance.supportToken()
      ) {
        throw new Error("Invalid parameter");
      }

      let userTokens =
        state.tokens?.userTokens[uniqueId]?.[selectedAccount.address];
      if (userTokens) {
        const hasSelected = userTokens.some((userToken) => {
          return (
            userToken.contractAddress.toLowerCase() ===
            token.contract.toLowerCase()
          );
        });
        if (hasSelected) {
          return true;
        }
      }
      // select the token
      const confirmToken = await this.popupServer.createRequestETHAddTokenPopup(
        { ...payload, uniqueId },
        siteMetadata,
      );
      if (!confirmToken) {
        throw new ProviderError(errorCodes.rpc.internal, "no confirm");
      }
      return true;
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw e;
    }
  };

  wallet_addEthereumChain = async (
    payload: ETHRequestParams<any>,
    { siteMetadata }: ServerMethodContext,
  ) => {
    logger.log("wallet_addEthereumChain", payload);
    try {
      const switchToChainId = payload.params?.[0].chainId;
      if (!switchToChainId) {
        throw new ProviderError(errorCodes.rpc.invalidParams, "chainId");
      }
      if (!siteMetadata) {
        throw new ProviderError(errorCodes.rpc.internal, "no site info");
      }
      const { params } = payload;
      const { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls } =
        params[0];
      const chainIdRequest = parseEthChainId(chainId);
      if (!chainIdRequest.valid) {
        throw new ProviderError(
          errorCodes.rpc.invalidParams,
          "invalid chainId",
        );
      }

      const state = (await appStorageInstance.getItem(
        "persist:root",
      )) as RematchRootState<RootModel, FullModel>;

      const existChainConfigs = getChainConfigsByFilter({
        state,
        filter: (item: ChainBaseConfig) =>
          item.coinType === CoinType.QTUM &&
          (item as QtumConfig).chainId === chainIdRequest.chainId.toString(),
      });

      if (existChainConfigs.length > 0) {
        this.emitEvent("chainChanged", switchToChainId);
        this.emitEvent("networkChanged", `${chainIdRequest.chainId}`);
        return null;
      }
      return null;
      //
      // const confirm = await this.popupServer.createRequestETHAddChainPopup(
      //   payload,
      //   siteMetadata,
      // );
      //
      // this.emitEvent("chainChanged", switchToChainId);
      // this.emitEvent("networkChanged", `${chainIdRequest.chainId}`);
      // return null;
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw e;
    }
  };

  wallet_switchEthereumChain = async (
    payload: ETHRequestParams<[{ chainId: string }]>,
    serverMethodContext: ServerMethodContext,
  ) => {
    try {
      const switchToChainId = payload.params?.[0].chainId;
      if (!switchToChainId) {
        throw new ProviderError(errorCodes.rpc.invalidParams, "chainId");
      }
      const { valid, chainId } = parseEthChainId(switchToChainId);

      if (!valid) {
        throw new ProviderError(
          errorCodes.rpc.invalidParams,
          "Invalid chainId",
        );
      }

      const state = (await appStorageInstance.getItem(
        "persist:root",
      )) as RematchRootState<RootModel, FullModel>;

      // check the chainId is in config
      const existChainConfigs = getChainConfigsByFilter({
        state,
        filter: (item: ChainBaseConfig) =>
          item.coinType === CoinType.QTUM &&
          (item as QtumConfig).chainId === chainId.toString(),
      });

      if (existChainConfigs.length === 0) {
        throw new ProviderError(
          errorCodes.rpc.invalidParams,
          "call wallet_addEthereumChain first",
        );
      }
      this.emitEvent("chainChanged", switchToChainId);
      this.emitEvent("networkChanged", `${chainId}`);
      // Metamask return null
      return null;
    } catch (e) {
      if (e instanceof ProviderError) {
        throw e;
      }
      const message = typeof e === "string" ? e : (e as Error).message;
      if (message) {
        if (message === ERROR_CODE.USER_CANCEL) {
          throw new ProviderError(
            errorCodes.provider.userRejectedRequest,
            "User rejected the request.",
          );
        } else {
          throw new ProviderError(errorCodes.rpc.internal, message);
        }
      }
      throw e;
    }
  };

  _setGlobalChainId = async (
    payload: string,
    serverMethodContext: ServerMethodContext,
  ) => {
    const chainId = payload;
    console.log("_setGlobalChainId server", chainId);
    await setStorageData("qtum", chainId);
    return chainId;
  };

  _getGlobalChainId = async (
    payload: ETHRequestParams<any>,
    serverMethodContext: ServerMethodContext,
  ) => {
    const chainId = await getStorageData<string>("qtum");
    return chainId ?? "0x51";
  };

  proxyRPCCall = async (
    payload: any,
    { siteMetadata }: ServerMethodContext,
  ) => {
    const currUniqueId = await this.getUniqueIdForSite(siteMetadata);

    const instance = this.coinService.getInstance(currUniqueId) as QtumService;
    const rpcServer = new RPCServer(instance.config.rpcList);
    let newPayload = payload;
    if (!payload.id) {
      newPayload.id = uuidv4();
    }
    return rpcServer.call(newPayload);
  };

  getUniqueIdForSite = async (
    siteMetadata?: SiteMetadata,
    requireNetwork: boolean = false,
  ) => {
    let currentChainId = siteMetadata?.network;
    if (!requireNetwork && !currentChainId) {
      currentChainId = "0x51";
    } else if (!currentChainId) {
      throw new ProviderError(errorCodes.rpc.invalidParams, "Invalid network");
    }
    const { valid, chainId } = parseEthChainId(currentChainId);
    if (!valid) {
      throw new ProviderError(errorCodes.rpc.invalidParams, "Invalid network");
    }
    const state = (await appStorageInstance.getItem(
      "persist:root",
    )) as RematchRootState<RootModel, FullModel>;
    const existChainConfigs = getChainConfigsByFilter({
      state,
      filter: (item: ChainBaseConfig) =>
        item.coinType === CoinType.QTUM &&
        (item as QtumConfig).chainId === chainId.toString(),
    });
    if (existChainConfigs.length === 0) {
      throw new ProviderError(errorCodes.rpc.invalidParams, "Invalid network");
    }
    return existChainConfigs[0].uniqueId;
  };
}
