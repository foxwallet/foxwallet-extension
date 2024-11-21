export interface BaseToken {
  symbol: string;
  decimals: number;
  name?: string;
}

export interface NativeToken extends BaseToken {
  // in case of the native token have an address
  address?: string;
  logo?: string;
  coingeckoCoinId?: string;
}

export interface NativeTokenWithAddress extends BaseToken {
  address: string;
  logo?: string;
}
