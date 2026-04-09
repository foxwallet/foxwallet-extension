export interface UTXO {
  txid: string;
  vout: number;
  value: string; // satoshi
  address: string;
  confirmations: number;
  isStake?: boolean;
  height?: number;
}

export interface SelectedUTXO extends UTXO {
  script?: Buffer;
  witnessUtxo?: {
    script: Buffer;
    value: number;
  };
  nonWitnessUtxo?: Buffer;
}

export interface FeeEstimate {
  fee: string; // satoshi
  feeRate: number; // sat/byte
  vBytes: number;
}

export interface QtumBalance {
  balance: string; // satoshi
  availableBalance: string; // satoshi
  unconfirmedBalance?: string;
}

export interface QtumTransaction {
  txid: string;
  blockHeight: number;
  confirmations: number;
  timestamp: number;
  from: string[];
  to: string[];
  value: string; // satoshi
  fee: string; // satoshi
  type: "send" | "receive" | "self";
}

export interface QtumInfoAddressResponse {
  balance: number;
  totalReceived: number;
  totalSent: number;
  unconfirmed: number;
  txCount: number;
}

export interface QtumInfoUTXOResponse {
  txid: string;
  vout: number;
  value: string;
  address: string;
  confirmations: number;
  isStake?: boolean;
  height?: number;
}

export interface BlockbookUTXOResponse {
  txid: string;
  vout: number;
  value: string;
  confirmations: number;
  height?: number;
}
