export interface SyncResp<T> {
  status: number;
  msg: string;
  data: T;
}
