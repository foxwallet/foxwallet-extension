import { ContentServerMethod } from "../background/servers/IWalletServer";
import { BaseProvider } from "./BaseProvider";
import { Utils } from "@/scripts/content/utils";
import { CoinType } from "core/types";
import { EmitData } from "@/scripts/content/type";
import { setStorageData, getStorageData } from "@/common/utils/storage";
import { parseEthChainId } from "core/coins/ETH/utils";
import {ProviderError} from "@/scripts/content/ErrorCode";

const chainHexToDec = (hex: string): string => {
  if (!hex) {
    return "1";
  }
  const { chainId, valid } = parseEthChainId(hex);
  return valid ? `${chainId}` : "1";
};

const chainDecToHex = (dec: string): string => {
  return "0x" + (dec || 1).toString(16);
};

export class FoxWeb3Provider extends BaseProvider {
  chain = CoinType.ETH;
  address: string | null = null;
  ready: boolean;
  _chainId: string;
  isDebug: boolean;
  config: unknown; //TODO fix
  constructor() {
    super();
    this._setInitialChainId();
  }

  _setInitialChainId() {
    this._getGlobalChainId()
      .then((evmNetwork) => {
        const network = chainHexToDec(evmNetwork ?? "0x1");
        this.emitChainChanged(evmNetwork ?? "0x1");
        this.emitNetworkChanged(network);
        console.log("_setInitialChainId", network);
      })
      .catch((err) => {
        console.log("_setInitialChainId", err);
        this.emitChainChanged("0x1");
        this.emitNetworkChanged("1");
      });
  }

  async _setGlobalChainId(chainId: string): Promise<string> {
    const result: string | undefined = await this.send(
      "_setGlobalChainId",
      chainId,
    );
    console.log("_setGlobalChainId", result);
    return result ?? "";
  }

  async _getGlobalChainId(): Promise<string> {
    const result: string | undefined = await this.send("_getGlobalChainId", {});
    console.log("_getGlobalChainId", result);
    return result ?? "0x1";
  }

  get isMetaMask() {
    return true;
  }
  get isConnected() {
    return !!this.address;
  }

  get chainId(): string {
    return this._chainId ?? "0x1";
  }
  get networkVersion(): string {
    const s = chainHexToDec(this._chainId ?? "0x1");
    console.log("get networkVersion", s);
    return s;
  }
  emitConnect(chainId: string) {
    this.emit("connect", { chainId: chainId });
  }

  emitChainChanged(chainId: string) {
    this.emit("chainChanged", chainId);
  }

  emitNetworkChanged(networkVersion: string) {
    this.emit("networkChanged", networkVersion);
  }

  get selectedAddress() {
    return this.address;
  }

  request(payload: any) {
    console.log("====>EthProvider request", payload);
    // this points to window in methods like web3.eth.getAccounts()
    var that = this;
    if (!(this instanceof FoxWeb3Provider)) {
      // @ts-ignore
      that = window.ethereum;
    }
    return that._request(payload);
  }

  _wrapResult(payload: any, result: any) {
    let data: {
      jsonrpc: string;
      id: string;
      result?: any;
    } = { jsonrpc: "2.0", id: payload.id };
    if (
      result !== null &&
      typeof result === "object" &&
      result.jsonrpc &&
      result.result
    ) {
      data.result = result.result;
    } else {
      data.result = result;
    }
    return data;
  }
  async _request(payload: any) {
    switch (payload.method) {
      case "eth_requestAccounts":
        return this.eth_requestAccounts(payload);
      case "eth_accounts":
        return this.eth_accounts(payload);
      case "eth_coinbase":
        return this.eth_coinbase(payload);
      case "net_version":
        return this.net_version(payload);
      case "eth_chainId":
        return this.eth_chainId(payload);
      case "eth_sign":
        throw new ProviderError(
          4200,
          "Fox does not support eth_sign. Please use other sign method instead.",
        );
      case "personal_sign":
        return this.personal_sign(payload);
      case "personal_ecRecover":
        return this.personal_ecRecover(payload);
      case "eth_signTypedData_v3":
        return this.eth_signTypedData_v3(payload);
      case "eth_signTypedData_v4":
        return this.eth_signTypedData_v4(payload);
      case "eth_signTypedData":
        return this.eth_signTypedData(payload);
      case "eth_sendTransaction":
        return this.eth_sendTransaction(payload);
      case "wallet_watchAsset":
        return this.wallet_watchAsset(payload);
      case "wallet_addEthereumChain":
        return this.wallet_addEthereumChain(payload);
      case "wallet_switchEthereumChain":
        return this.wallet_switchEthereumChain(payload);
      case "wallet_requestPermissions":
        return this.wallet_requestPermissions(payload);
      case "wallet_getPermissions":
        return this.wallet_getPermissions(payload);
      case "wallet_revokePermissions":
        return this.wallet_revokePermissions(payload);
      case "eth_newFilter":
      case "eth_newBlockFilter":
      case "eth_newPendingTransactionFilter":
      case "eth_uninstallFilter":
      case "eth_subscribe":
        throw new ProviderError(
          4200,
          `Fox does not support calling ${payload.method}. Please use your own solution`,
        );
      default:
        // call upstream rpc
        // this.callbacks.delete(payload.id);
        // this.wrapResults.delete(payload.id);
        console.log("unhandled", payload);
        payload.jsonrpc = "2.0";
        // this.rpc
        //   .call(payload)
        //   .then((response: any) => {
        //     if (this.isDebug) {
        //     }
        //     wrapResult ? resolve(response) : resolve(response.result);
        //   })
        //   .catch(reject);
        const proxyResult = await this.proxyRPCCall(payload);
        console.log(`<== rpc response ${JSON.stringify(proxyResult)}`);
        return (proxyResult as any)?.result;
    }
  }

  async proxyRPCCall(payload: any) {
    return this.send("proxyRPCCall", payload);
  }

  /**
   * @deprecated Use request() method instead.
   */
  sendAsync(payload: any, callback: (err: null | any, data?: any) => void) {
    console.log(
      "sendAsync(data, callback) is deprecated, please use window.ethereum.request(data) instead.",
    );
    // this points to window in methods like web3.eth.getAccounts()
    var that = this;
    if (!(this instanceof FoxWeb3Provider)) {
      // @ts-ignore
      that = window.ethereum;
    }
    if (Array.isArray(payload)) {
      Promise.all(
        payload.map((_payload) =>
          that
            ._request(_payload)
            .then((data) => callback(null, this._wrapResult(_payload, data)))
            .catch((error) => callback(error, null)),
        ),
      );
    } else {
      that
        ._request(payload)
        .then((data) => callback(null, this._wrapResult(payload, data)))
        .catch((error) => callback(error, null));
    }
  }

  async eth_accounts(payload: any) {
    console.log("eth_accounts", payload);
    const accountsInfo: String[] | undefined = await this.send(
      "eth_accounts",
      payload,
    );
    console.log("accountsInfo", accountsInfo);
    this.emitChainChanged(await this.eth_chainId({}));
    this.emitNetworkChanged(await this.net_version({}));
    if ((accountsInfo as string[])[0]) {
      this.address = (accountsInfo as string[])[0];
    }
    return accountsInfo ?? [];
  }
  async eth_requestAccounts(payload: any) {
    const newAccounts = await this.send("eth_requestAccounts", payload);
    // handle newAccounts
    console.log("newAccounts", newAccounts);
    // Utils.emitConnectEvent(this.chain, this.config, {
    //   address: data[0],
    // });
    this.emitConnect(await this.eth_chainId({}));
    this.emitChainChanged(await this.eth_chainId({}));
    if ((newAccounts as string[])[0]) {
      this.address = (newAccounts as string[])[0];
    }
    return newAccounts;
  }

  async eth_coinbase(payload: any): Promise<string | null> {
    const accounts = await this.eth_accounts(payload);
    return (accounts as string[])?.[0] || null;
  }

  async net_version(payload: any): Promise<string> {
    return this.networkVersion;
  }

  async eth_chainId(payload: any): Promise<string> {
    return this._chainId;
  }

  async wallet_requestPermissions(payload: any) {
    const result = await this.send("wallet_requestPermissions", payload);
    console.log("wallet_requestPermissions", result);
    return result;
  }
  async wallet_getPermissions(payload: any) {
    const result = await this.send("wallet_getPermissions", payload);
    console.log("wallet_getPermissions", result);
    return result;
  }
  async wallet_revokePermissions(payload: any) {
    const result = await this.send("wallet_revokePermissions", payload);
    console.log("wallet_revokePermissions", result);
    return result;
  }

  async personal_sign(payload: any) {
    const result = await this.send("personal_sign", payload);
    console.log("personal_sign", result);
    return result;
  }

  async personal_ecRecover(payload: any) {
    const result = await this.send("personal_ecRecover", payload);
    console.log("personal_ecRecover", result);
    return result;
  }

  async eth_signTypedData_v3(payload: any) {
    const result = await this.send("eth_signTypedData_v3", payload);
    console.log("eth_signTypedData_v3", result);
    return result;
  }

  async eth_signTypedData_v4(payload: any) {
    const result = await this.send("eth_signTypedData_v4", payload);
    console.log("eth_signTypedData_v4", result);
    return result;
  }

  async eth_signTypedData(payload: any) {
    const result = await this.send("eth_signTypedData", payload);
    console.log("eth_signTypedData", result);
    return result;
  }
  async eth_sendTransaction(payload: any) {
    const result = await this.send("eth_sendTransaction", payload);
    console.log("eth_sendTransaction", result);
    return result;
  }

  async wallet_watchAsset(payload: any) {
    const result = await this.send("wallet_watchAsset", payload);
    console.log("wallet_watchAsset", result);
    return result;
  }

  async wallet_addEthereumChain(payload: any) {
    const result = await this.send("wallet_addEthereumChain", payload);
    console.log("wallet_addEthereumChain", result);
    return result;
  }
  async wallet_switchEthereumChain(payload: any) {
    const result = await this.send("wallet_switchEthereumChain", payload);
    console.log("wallet_switchEthereumChain", result);
    return result;
  }

  sendResponse(id: string, result: any) {
    let data: any = { jsonrpc: "2.0", id };
    if (
      result !== null &&
      typeof result === "object" &&
      result.jsonrpc &&
      result.result
    ) {
      data.result = result.result;
    } else {
      data.result = result;
    }
    return data;
  }

  send<T>(method: ContentServerMethod<CoinType>, payload: any) {
    return super.send<T>(method, payload, {
      network: this.chainId,
    });
  }

  emit(event: string, params: any) {
    super.emit(event, params);
    console.log("eth emit", event, params);
    switch (event) {
      case "chainChanged":
        if (typeof params === "string" && !!params) {
          this._chainId = params;
          this._setGlobalChainId(params).catch((err) => {
            console.log("_setGlobalChainId", err);
          });
        }
        break;
      case "networkChanged":
        break;
      case "accountsChanged":
        if (typeof params?.[0] === "string" && !!params?.[0]) {
          this.address = params[0];
        }
        break;
      case "connect":
        if (typeof params?.chainId === "string" && !!params?.chainId) {
          this._chainId = params.chainId;
        }
        break;
      case "disconnect":
        break;
    }
  }

  onDappEmit(event: { detail: EmitData }) {
    const { detail } = event;
    const { type, coinType, event: emitEvent, data } = detail;
    if (coinType !== CoinType.ETH) {
      return;
    }
    this.emit(emitEvent, data);
  }
}
