export enum AleoTransferMethod {
  PUBLIC = "transfer_public",
  PUBLIC_TO_PRIVATE = "transfer_public_to_private",
  PRIVATE = "transfer_private",
  PRIVATE_TO_PUBLIC = "transfer_private_to_public",
}

export enum AleoRecordMethod {
  JOIN = "join",
  SPLIT = "split",
}

export const ALEO_METHOD_BASE_FEE_MAP = {
  [AleoTransferMethod.PRIVATE]: 2210n,
  [AleoTransferMethod.PRIVATE_TO_PUBLIC]: 129109n,
  [AleoTransferMethod.PUBLIC]: 263388n,
  [AleoTransferMethod.PUBLIC_TO_PRIVATE]: 136587n,
  [AleoRecordMethod.JOIN]: 2055n,
  [AleoRecordMethod.SPLIT]: 0n,
};

export type AleoCreditMethod = AleoTransferMethod | AleoRecordMethod;
