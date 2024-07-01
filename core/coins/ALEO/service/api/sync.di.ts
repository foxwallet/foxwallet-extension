export interface RecordRawInfo {
  block_height: number;
  // in seconds
  block_time: number;
  commitment: string;
  ciphertext: string;
  transition_id: string;
  transition_program: string;
  transition_function: string;
  transaction_id: string;
}

export interface RecordFileInfo {
  id: number;
  record_type: "output" | "input";
  start_block: number;
  end_block: number;
  file_path: string;
  file_size: string;
  // in second
  create_time: number;
}

export interface SyncResp<T> {
  status: number;
  msg: string;
  data: T;
}
