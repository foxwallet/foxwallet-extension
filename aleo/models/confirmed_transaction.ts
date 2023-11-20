import { Transaction } from "./transaction";

export type ConfirmedTransaction = {
  status: string;
  type: string;
  index: number;
  transaction: Transaction;
};
