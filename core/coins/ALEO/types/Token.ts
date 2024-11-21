import { type Balance } from "./Balance";
import { type InnerProgramId } from "./ProgramId";

export interface Token {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  official: boolean;
  programId: InnerProgramId;
}

export type TokenWithBalance = Token & {
  balance: Balance;
};
