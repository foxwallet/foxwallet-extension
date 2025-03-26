export type Currency = {
  symbol: string;
  decimals: number;
  name?: string;
};

export type NativeCurrency = Currency & {
  icon?: string;
  contractAddress?: string;
  coingeckoCoinId?: string;
};
