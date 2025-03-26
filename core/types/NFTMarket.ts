export interface NFTMarket {
  name: string;
  baseUrl: string;
  itemPath: string;
  collectionPath: string;
}

export type NFTConfig = {
  supportResync?: boolean;
  supportCollectionWay?: boolean;
  markets?: NFTMarket[];
};
