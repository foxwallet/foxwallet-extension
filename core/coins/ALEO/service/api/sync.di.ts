export interface RecordRawInfo {
  id: number;
  commitment: string;
  ciphertext: string;
  program_id: string;
  function_name: string;
  transaction_id: string;
  transition_id: string;
  transaction_index: number;
  transition_index: number;
  output_index: number;
  block_height: number;
  timestamp: number;
}

export interface SyncResp<T> {
  status: number;
  msg: string;
  data: T;
}
