export enum CoreErrorCode {
  INVALID_PRIVATE_KEY = "INVALID_PRIVATE_KEY",
  DERIVE_VIEW_KEY_FAILED = "DERIVE_VIEW_KEY_FAILED",
}

export class CoreError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message);
    this.code = code;
  }
}
