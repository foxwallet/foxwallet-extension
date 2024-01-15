import { CoinType } from "core/types";
import { dappDB } from "@/database/DappDatabase";
import { AleoConnectHistory, DappRequest } from "@/database/types/dapp";

export class DappStorage {
  constructor() {}

  async getStorageInstance() {
    if (!dappDB.isOpen) {
      await dappDB.open();
    }
    return dappDB;
  }

  getConnectHistory = async (coinType: CoinType, address: string) => {
    const instance = await this.getStorageInstance();
    switch (coinType) {
      case CoinType.ALEO: {
        const historyList = await instance.aleo_connect_history
          .where({
            address,
          })
          .toArray();
        return historyList;
      }
    }
  };

  addConnectHistory = async (
    coinType: CoinType,
    address: string,
    history: AleoConnectHistory,
  ) => {
    const instance = await this.getStorageInstance();
    switch (coinType) {
      case CoinType.ALEO: {
        const count = await instance.aleo_connect_history
          .where({
            address,
            network: history.network,
            "site.origin": history.site.origin,
          })
          .count();
        if (count) {
          await instance.aleo_connect_history
            .where({
              address,
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
          await instance.aleo_connect_history.add({
            ...history,
            address,
          });
        }
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
      case CoinType.ALEO: {
        await instance.aleo_connect_history
          .where({
            address,
            network: chainId,
            "site.origin": origin,
          })
          .modify((item) => {
            item.disconnected = true;
          });
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
