import {
  createDappHistoryStorage,
  dappRequestStorage,
} from "@/common/utils/indexeddb";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConnectHistory } from "../../types/connect";
import { uniqBy } from "lodash";
import { DappRequest } from "../../types/dapp";
import { CoinType } from "core/types";

// 地址和 dapp 的映射，还包括 permission
export class DappStorage {
  #dappHistoryMap = new Map<CoinType, LocalForage>();
  #dappRequestInstance: LocalForage;

  constructor() {
    this.#dappHistoryMap = new Map();
    this.#dappRequestInstance = dappRequestStorage;
  }

  getDappHistoryInstance = (coinType: CoinType) => {
    const existInstance = this.#dappHistoryMap.get(coinType);
    if (existInstance) {
      return existInstance;
    }
    const newInstance = createDappHistoryStorage(coinType);
    this.#dappHistoryMap.set(coinType, newInstance);
    return newInstance;
  };

  getConnectHistory = async (coinType: CoinType, address: string) => {
    const instance = this.getDappHistoryInstance(coinType);
    const history: AleoConnectHistory[] | null =
      await instance.getItem(address);
    return history || [];
  };

  addConnectHistory = async (
    coinType: CoinType,
    address: string,
    history: AleoConnectHistory,
  ) => {
    const instance = this.getDappHistoryInstance(coinType);
    const historyList = await this.getConnectHistory(coinType, address);
    const newHistoryList = uniqBy(
      [history, ...historyList],
      (item) => item.site.origin + item.network,
    );
    await instance.setItem(address, newHistoryList);
  };

  disconnect = async (coinType: CoinType, address: string, chainId: string) => {
    const instance = this.getDappHistoryInstance(coinType);
    const historyList = await this.getConnectHistory(coinType, address);
    const newHistoryList = historyList.map((item) => {
      if (item.network === chainId) {
        return {
          ...item,
          disconnected: true,
        };
      }
      return item;
    });
    await instance.setItem(address, newHistoryList);
  };

  getDappRequest = async (id: string) => {
    const instance = this.#dappRequestInstance;
    const request: DappRequest | null = await instance.getItem(id);
    return request;
  };

  setDappRequest = async (request: DappRequest) => {
    const instance = this.#dappRequestInstance;
    await instance.setItem(request.id, request);
  };

  removeDappRequest = async (id: string) => {
    const instance = this.#dappRequestInstance;
    await instance.removeItem(id);
  };
}
