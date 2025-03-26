export type Tag = {
  name?: string;
};

export type MinerData = {
  qualityAdjPower: string;
  rawBytePower: string;
  networkRawBytePower: string;
  networkQualityAdjPower: string;
  blocksMined: number;
  weightedBlocksMined: number;
  totalRewards: string;
  sectors: Sectors;
  availableBalance: string;
  initialPledgeRequirement: string;
  vestingFunds: string;
  owner: Address;
  worker: Address;
  controlAddresses: Address[];
};

export type AddressData = {
  id: string;
  address: string;
  robust: string;
  balance: string;
  ownedMiners?: string[];
  status?: number;
  tag?: Tag;
  miner?: MinerData;
};

export type Sectors = {
  live: number;
  active: number;
  faulty: number;
  recovering: number;
};

export type Address = {
  address?: string;
  balance?: string;
};

export type PriceRes = {
  price: number;
};

export type TransactionReceipt = {
  exitCode: number;
  return?: string;
  gasUsed?: number;
};

export type UnconfirmTransactionRes = {
  totalCount: number;
  messages: UnconfirmTransactionResMsg[];
};

export type UnconfirmTransactionResMsg = {
  cid: string;
  from: string;
  to: string;
  nonce: number;
  value: string;
  gasLimit: number;
  gasFeeCap: string;
  gasPremium: string;
  method: string;
  methodNumber: number;
  createTimestamp: number;
};

export type TransactionHistoryResMsg = {
  message: string;
  height: number;
  timestamp: number;
  value: string;
};

export type TransactionHistoryRes = {
  totalCount: number;
  transfers: TransactionHistoryResMsg[];
};

export type TransactionRes = {
  cid: string;
  height: number;
  timestamp: number;
  confirmations: number;
  nonce: number;
  value: string;
  gasLimit: number;
  gasFeeCap: string;
  gasPremium: string;
  baseFee: string;
  fee: TransactionFee;
  receipt: TransactionReceipt;
  from: string;
  to: string;
};

type TransactionFee = {
  baseFeeBurn: string;
  overEstimationBurn: string;
  minerPenalty: string;
  minerTip: string;
  refund: string;
};

export type Gas = {
  method: string;
  count: string;
  fee: number;
  gasFeeCap: number;
  gasLimit: number;
  gasPremium: number;
  gasUsed: number;
  totalFee: string;
};

export type BaseFeeItem = {
  timestamp: number;
  baseFee: number;
};

export type BaseFeeChartItem = {
  x: Date;
  y: number;
};

export type Overview = {
  height: number;
  // timestamp: number;
  // totalRawBytePower: string;
  totalQualityAdjPower: string;
  totalQualityAdjPowerDelta: string;
  activeMiners: number;
  activeMinersGrowth: number;
  blockReward: string;
  averageRewardPerByte: number;
  sealCost: number;
  estimatedInitialPledgeCollateral: number;
  baseFee: string;
  price: number;
  priceChangePercentage: number;
  circulatingSupply: string;
  totalMaxSupply: string;
  totalPledgeCollateral: string;
};

export type MinerItem = {
  address?: string;
  status?: number;
  id?: string;
  tag?: Tag;
};

export type MiningStats = {
  rawBytePowerGrowth: string;
  qualityAdjPowerGrowth: string;
  rawBytePowerDelta: string;
  qualityAdjPowerDelta: string;
  blocksMined: number;
  weightedBlocksMined: number;
  totalRewards: string;
  networkTotalRewards: string;
  equivalentMiners: number;
  rewardPerByte: number;
  luckyValue: number;
  durationPercentage: number;
};

export type StatsItem = {
  qualityAdjPower?: string;
  luckyValue?: number;
  powerDelta?: string;
  balance?: string;
  availableBalance?: string;
  initialPledgeRequirement?: string;
  initialPledge?: number;
  growthSectorPledge?: number;
  vestingFunds?: string;
  miningStats?: MiningStats;
  sectors?: Sectors;
  totalRewards?: string;
  owner?: Address;
  worker?: Address;
  controlAddresses?: Address[];
};

export type Miner = {
  name: string;
  freshTime: number;
  miner: MinerItem;
  stats: StatsItem;
};

export type MinerApiData = {
  overview: AddressData;
  miner_status: StatsItem;
};

export type MinerExist = {
  type: string;
  address: string;
};

export type OwnedMiners = {
  id: string;
  status: number; // status:1 待收藏 2:已收藏
};

export type CollectMiner = {
  id: string;
  address: string;
  robust: string;
  ownedMiners: OwnedMiners[];
  owner: boolean;
  status: number;
  tag?: Tag;
};

export enum MethodType {
  METHOD_SEND = "Send",
  METHOD_APPROVE = "Approve",
  METHOD_PROPOSE = "Propose",
  METHOD_EXEC = "EXEC",
}

export type TipSetRes = {
  Height: number;
};

export type StateGetActorRes = {
  Nonce: number;
};
