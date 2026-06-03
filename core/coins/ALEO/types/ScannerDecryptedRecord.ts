export interface ScannerDecryptedRecord {
  tag: string;
  plaintext: string;
}

export type ScannerDecryptedRecordMap = Record<string, ScannerDecryptedRecord>;
