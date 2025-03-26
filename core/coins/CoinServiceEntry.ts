import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type AleoConfig } from "./ALEO/types/AleoConfig";
import { AleoService } from "./ALEO/service/AleoService";
import { CoinType } from "core/types";
import { AleoStorage } from "@/scripts/background/store/aleo/AleoStorage";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { getChainConfig } from "@/services/coin/CoinService";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";
import { EthService } from "core/coins/ETH/service/EthService";
import { type CoinServiceBasic } from "core/coins/CoinServiceBasic";

export type CoinService = AleoService | EthService;

export type ChainConfigMap = {
  [uniqueId in ChainUniqueId]: ChainBaseConfig;
};

export class CoinServiceEntry {
  serviceMap: { [uniqueId in ChainUniqueId]?: CoinServiceBasic };

  constructor() {
    this.serviceMap = {};
  }

  getInstance(uniqueId: ChainUniqueId): CoinService {
    if (!this.serviceMap[uniqueId]) {
      let instance: CoinService;
      const config = this.getChainConfig(uniqueId);
      switch (config.coinType) {
        case CoinType.ALEO: {
          const aleoConfig = config as AleoConfig;
          instance = this.initAleoService(aleoConfig);
          break;
        }
        case CoinType.ETH: {
          const ethConfig = config as ETHConfig;
          instance = this.initEthService(ethConfig);
          break;
        }
        default: {
          throw new Error(`need implement initService for ${config.coinType}`);
        }
      }
      this.serviceMap[uniqueId] = instance;
    }
    return this.serviceMap[uniqueId] as CoinService;
  }

  rmCachedInstance(uniqueId: ChainUniqueId) {
    if (!this.serviceMap[uniqueId]) {
      return;
    }
    this.serviceMap[uniqueId] = undefined;
  }

  getChainConfig(uniqueId: ChainUniqueId): ChainBaseConfig {
    // return this.chainConfig[uniqueId];
    return getChainConfig({ uniqueId });
  }

  protected initAleoService(aleoConfig: AleoConfig) {
    return new AleoService(aleoConfig);
  }

  protected initEthService(ethConfig: ETHConfig) {
    return new EthService(ethConfig);
  }
}

export const coinServiceEntry = new CoinServiceEntry();
