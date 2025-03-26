export class ProviderError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super();
    this.code = code;
    this.message = message;
  }

  toString() {
    return `${this.message} (${this.code})`;
  }
}

export interface ErrorCodes {
  readonly rpc: {
    readonly invalidInput: -32000;
    readonly resourceNotFound: -32001;
    readonly resourceUnavailable: -32002;
    readonly transactionRejected: -32003;
    readonly methodNotSupported: -32004;
    readonly limitExceeded: -32005;
    readonly parse: -32700;
    readonly invalidRequest: -32600;
    readonly methodNotFound: -32601;
    readonly invalidParams: -32602;
    readonly internal: -32603;
  };
  readonly provider: {
    readonly userRejectedRequest: 4001;
    readonly unauthorized: 4100;
    readonly unsupportedMethod: 4200;
    readonly disconnected: 4900;
    readonly chainDisconnected: 4901;
    readonly requestTimeout: 4500;
  };
}

export const errorCodes: ErrorCodes = {
  rpc: {
    invalidInput: -32000,
    resourceNotFound: -32001,
    resourceUnavailable: -32002,
    transactionRejected: -32003,
    methodNotSupported: -32004,
    limitExceeded: -32005,
    parse: -32700,
    invalidRequest: -32600,
    methodNotFound: -32601,
    invalidParams: -32602,
    internal: -32603,
  },
  provider: {
    userRejectedRequest: 4001,
    unauthorized: 4100,
    unsupportedMethod: 4200,
    disconnected: 4900,
    chainDisconnected: 4901,
    requestTimeout: 4500,
  },
};


export class SerializableError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }

  toString() {
    return `${this.message}`;
  }
}
