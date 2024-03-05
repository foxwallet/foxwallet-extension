export interface AlphaToken {
  token_id: string;
  name: string;
  origin_name: string;
  symbol: string;
  origin_symbol: string;
  decimals: number;
  total_supply: string;
  logo: string;
  token_type: number;
  liquidity: string;
  liquidity_aleo: string;
}

export interface AllTokenResp {
  code: number;
  msg: string;
  data: {
    tokens: AlphaToken[];
  };
}
