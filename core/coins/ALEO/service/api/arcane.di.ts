import { InnerProgramId } from "../../types/ProgramId";

export interface FieldValue {
  type: "field";
  value: string;
}

export interface U8Value {
  type: "u8";
  value: string;
}

export interface U128Value {
  type: "u128";
  value: string;
}

export interface ArcaneToken {
  id: number;
  admin: string;
  tokenId: FieldValue;
  decimals: U8Value;
  maxSupply: U128Value;
  logo: string;
  program: InnerProgramId;
  symbol: string;
  name: string | null;
  type: string;
  verified: boolean;
  isPossibleScam: boolean;
  createdAt: string;
  updatedAt: string;
  usdPrice: string;
}

export interface ArcaneTokensResp {
  tokens: ArcaneToken[];
}
