import { Transaction } from "./AleoTransaction";

export type ConfirmedTransaction = {
  status: string;
  type: string;
  index: number;
  transaction: Transaction;
};
