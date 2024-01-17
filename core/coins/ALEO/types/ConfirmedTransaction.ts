import { AleoTransaction } from "./Transaction";

export type ConfirmedTransaction = {
  status: string;
  type: string;
  index: number;
  transaction: AleoTransaction;
};
