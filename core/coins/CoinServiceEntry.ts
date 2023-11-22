import { ChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConfig } from "./ALEO/types/AleoConfig";
import { AleoService } from "./ALEO/service/AleoService";
import { CoinType } from "core/types";
import { AleoStorage } from "@/scripts/background/store/aleo/AleoStorage";

export type CoinConfig = AleoConfig;

export type CoinService = AleoService;

export type ChainConfigMap = {
  [uniqueId in ChainUniqueId]: CoinConfig;
};

export class CoinServiceEntry {
  serviceMap: { [uniqueId in ChainUniqueId]?: AleoService };

  constructor(private chainConfig: ChainConfigMap) {
    this.serviceMap = {};
  }

  getInstance(uniqueId: ChainUniqueId): CoinService {
    if (!this.serviceMap[uniqueId]) {
      let instance: CoinService;
      const config = this.getChainConfig(uniqueId);
      switch (config.coinType) {
        case CoinType.ALEO: {
          const aleoConfig = config as AleoConfig;
          instance = this.initAleosService(aleoConfig);
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

  getChainConfig(uniqueId: ChainUniqueId): CoinConfig {
    return this.chainConfig[uniqueId];
  }

  protected initAleosService(aleoConfig: AleoConfig) {
    return new AleoService(aleoConfig, AleoStorage.getInstance());
  }
}
