import type { CoinType } from "core/types";

export interface ProviderMetadata {
  network?: string | null;
  address?: string | null;
}
export interface EmitData {
  type: "EmitData";
  event: string;
  coinType: CoinType;
  data?: any;
}
