import { Balance } from "./Balance";

export interface Token {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  official: boolean;
  programId: string;
}

export type TokenWithBalance = Token & {
  balance: Balance;
};
