import { CoinType } from "core/types";
import { dappDB } from "@/database/DappDatabase";
import { ConnectHistory, DappRequest } from "@/database/types/dapp";

export class DappStorage {
  constructor() {}

  async getStorageInstance() {
    if (!dappDB.isOpen) {
      await dappDB.open();
    }
    return dappDB;
  }

  getConnectHistory = async (
    coinType: CoinType,
    address: string,
    chainId: string,
  ) => {
    const instance = await this.getStorageInstance();
    switch (coinType) {
      case CoinType.ALEO: {
        return instance.dapp_history
          .where("[address+coinType+network]")
          .equals([address, coinType, chainId])
          .toArray();
      }
      case CoinType.ETH: {
        if (!chainId) {
          return instance.dapp_history
            .where("[address+coinType]")
            .equals([address, coinType])
            .toArray();
        }
        return instance.dapp_history
          .where("[address+coinType+network]")
          .equals([address, coinType, chainId])
          .toArray();
      }
    }
  };

  addConnectHistory = async (
    coinType: CoinType,
    address: string,
    history: ConnectHistory,
  ) => {
    const instance = await this.getStorageInstance();
    switch (coinType) {
      case CoinType.ETH:
        const count = await instance.dapp_history
          .where({
            address,
            coinType,
            "site.origin": history.site.origin,
          })
          .count();
        if (count) {
          await instance.dapp_history
            .where({
              address,
              coinType,
              "site.origin": history.site.origin,
            })
            .modify((item) => {
              item.decryptPermission =
                history.decryptPermission || item.decryptPermission;
              item.disconnected = false;
              item.lastConnectTime = Date.now();
              item.programs = history.programs;
            });
        } else {
          await instance.dapp_history.add({
            ...history,
            address,
            coinType,
          });
        }
        break;
      case CoinType.ALEO: {
        const count = await instance.dapp_history
          .where({
            address,
            coinType,
            network: history.network,
            "site.origin": history.site.origin,
          })
          .count();
        if (count) {
          await instance.dapp_history
            .where({
              address,
              coinType,
              network: history.network,
              "site.origin": history.site.origin,
            })
            .modify((item) => {
              item.decryptPermission =
                history.decryptPermission || item.decryptPermission;
              item.disconnected = false;
              item.lastConnectTime = Date.now();
              item.programs = history.programs;
            });
        } else {
          await instance.dapp_history.add({
            ...history,
            address,
            coinType,
          });
        }
        break;
      }
    }
  };

  disconnect = async (
    coinType: CoinType,
    address: string,
    chainId: string,
    origin: string,
  ) => {
    const instance = await this.getStorageInstance();
    switch (coinType) {
      case CoinType.ETH:
      case CoinType.ALEO: {
        await instance.dapp_history
          .where({
            address,
            coinType,
            network: coinType === CoinType.ETH ? "" : chainId,
            "site.origin": origin,
          })
          .modify((item) => {
            item.disconnected = true;
          });
        break;
      }
    }
  };

  getDappRequest = async (id: string) => {
    const instance = await this.getStorageInstance();
    return await instance.request.get(id);
  };

  setDappRequest = async (request: DappRequest) => {
    const instance = await this.getStorageInstance();
    const item = await instance.request.get(request.id);
    if (item) {
      await instance.request.put(
        {
          ...item,
          ...request,
        },
        request.id,
      );
    } else {
      await instance.request.add({
        ...request,
      });
    }
  };

  removeDappRequest = async (id: string) => {
    const instance = await this.getStorageInstance();
    await instance.request.delete(id);
  };
}
