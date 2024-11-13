import { type TaskPriority } from "./SyncTask";

export interface AleoSyncAccount {
  walletId: string;
  accountId: string;
  address: string;
  viewKey: string;
  priority: TaskPriority;
}
