export interface RecordDetail {
  commitment: string;
  programId: string;
  functionName: string;
  plaintext: string;
  ciphertext: string;
  content: { [key in string]: any };
  nonce: string;
  tag: string;
  transactionId: string;
  transitionId: string;
  transactionIndex: number;
  transitionIndex: number;
  outputIndex: number;
  height: number;
  timestamp: number;
  recordName?: string;
}

export type RecordDetailWithSpent = RecordDetail & {
  spent: boolean;
  parsedContent?: { [key in string]: any };
};

export type AleoAddressInfo = {
  recordsMap: {
    [program in string]?: { [commitment in string]?: RecordDetailWithSpent };
  };
  begin: number;
  end: number;
  address: string;
};
