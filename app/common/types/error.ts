export enum ERROR_CODE {
  NOT_AUTH = "not auth",
  INVALID_ARGUMENT = "invalid argument",
  NOT_INIT = "Wallet not init",
  USER_CANCEL = "user cancel",
}

export enum HttpErrorType {
  TIMEOUT = "timeout",
}

export class HttpError extends Error {
  constructor(private errorType: HttpErrorType) {
    super(errorType);
  }

  getErrorType(): HttpErrorType {
    return this.errorType;
  }
}
