export enum AleoTransferMethod {
  PUBLIC = "transfer_public",
  PUBLIC_TO_PRIVATE = "transfer_public_to_private",
  PRIVATE = "transfer_private",
  PRIVATE_TO_PUBLIC = "transfer_private_to_public",
  JOIN = "join",
  SPLIT = "split",
}

export enum AleoRecordMethod {
  JOIN = "join",
  SPLIT = "split",
}

export type AleoCreditMethod = AleoTransferMethod | AleoRecordMethod;
