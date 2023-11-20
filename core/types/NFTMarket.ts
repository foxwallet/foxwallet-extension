import { type ChainUniqueId } from "./ChainUniqueId";

export interface NFTMarket {
  name: string;
  baseUrl: string;
  itemPath: string;
  collectionPath: string;
}

export interface NFTApiConfig {
  uniqueId: ChainUniqueId;
  supportResync: boolean;
}

export type NFTConfig = Pick<NFTApiConfig, "supportResync">;
