import { sleep } from "./sleep";
import axios from "axios";

/**
 * @deprecated
 */
export enum AutoSwitchServiceType {
  RPC = "rpc",
  API = "api",
}

export const isNetworkError = (err: any) => {
  if (err?.message && typeof err.message === "string") {
    const msg = err.message.toLowerCase();
    return (
      axios.isAxiosError(err) ||
      msg === "network error" || // filecoin
      msg.includes("notok") ||
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("could not detect network") || // ethers.js
      msg.includes("access forbidden") ||
      msg.includes("bad result") || // ethers.js
      msg.includes("bad response") || // ethers.js
      msg.includes("bad status") || // coreum
      msg.includes("doesn't exist") || // goplus rpc
      msg.includes("does not exist") || // zksync era
      msg.includes("missing response") || // ethers.js
      msg.includes("missing revert data") || // ethers.js
      msg.includes("missing permission") || // filecoin
      msg.includes("not supported") || // filecoin
      msg.includes("not allowed") || // ethers.js
      msg.includes("not available") || // solana
      msg.includes("request failed") || // solana
      msg.includes("429") || // solana
      msg.includes("rate limit") || // blockscout
      msg.includes("plan limit") || // solana
      msg.includes("request limit") || // solana
      msg.includes("frequency limit") || // tron grid
      msg.includes("credits limit") || // solana
      msg.includes("free tier limit") || // solana
      msg.includes("too many requests") || // solana
      msg.includes("method unavailable") || // solana
      msg.includes("method not found") || // solana
      msg.includes("status code 403") || // blockscout
      msg.includes("unable to perform request") || // solana
      msg.includes("underlying network changed") || // filecoin evm
      msg.includes("tipset height in future") || // filecoin evm
      msg.includes("invalid opcode: invalid") || // ethers.js
      /.*status code:? 5[0-9][0-9].*/.test(msg) || // blockbook
      /.*error:? 5[0-9][0-9].*/.test(msg) || // solana
      msg.includes("unrecognized token") || // solana
      msg.includes("token not valid") || // solana
      msg.includes("node is behind by") || // solana
      msg.includes("remote error") || // zksync era
      msg.includes("exceeded the quota usage") || // zksync era
      msg.includes("failed to serve request") || // zksync era
      msg.includes("resourceexhausted") // zkfair
    );
  }
  return false;
};

export const isServerError = (err: any) => {
  if (err?.message && typeof err.message === "string") {
    const msg = err.message;
    return msg.includes("statusCode 5");
  }
  return false;
};

export const isInternetUnreachable = async () => {
  return !navigator.onLine;
};

/**
 * @deprecated
 */
export const getServiceNameByType = (type: AutoSwitchServiceType) => {
  return `${type}Service`;
};

/**
 * @deprecated
 */
async function loop(
  obj: any,
  serviceType: AutoSwitchServiceType,
  method: any,
  args: any[],
  emptyValue: any,
  retryTimes: number = 0,
  shouldPreventSwitch: () => Promise<boolean>,
  propertyKey: string,
  waitTime?: number,
): Promise<any> {
  try {
    return await method.apply(obj, args);
  } catch (error) {
    const prevent = await shouldPreventSwitch();

    const serviceName = getServiceNameByType(serviceType);
    const service = obj[serviceName];
    if (!service) {
      throw new Error(`${serviceName} doesn't exist in ${obj}`);
    }
    if (!(service instanceof AutoSwitchService)) {
      throw new Error(
        "AutoSwitch can only work on AutoSwitchService and it's sub class. " +
          serviceName +
          "  " +
          obj,
      );
    }
    if (
      (isNetworkError(error) || isServerError(error)) &&
      !prevent &&
      retryTimes < 10 &&
      service.canSwitch()
    ) {
      console.log(
        "method: " + propertyKey,
        " switch to next due to:",
        (error as Error).message,
      );
      const methodName = "switchToNext";
      service[methodName].bind(service)();
      if (waitTime) {
        await sleep(waitTime);
      }
      return loop(
        obj,
        serviceType,
        method,
        args,
        emptyValue,
        retryTimes + 1,
        shouldPreventSwitch,
        propertyKey,
        waitTime,
      );
    }
    console.log(
      "method: " + propertyKey,
      " retry loop throw error:",
      // @ts-expect-error error message
      error.message,
      " isNetworkError " + isNetworkError(error),
      retryTimes,
      " navigator.onLine: ",
      navigator.onLine,
      " prevent: ",
      prevent,
    );
    throw error;
  }
}

/**
 * @deprecated
 */
export function AutoSwitch(params: {
  serviceType: AutoSwitchServiceType;
  waitTime?: number;
  emptyValue?: any;
  shouldPreventSwitch?: () => Promise<boolean>;
}) {
  const { serviceType, emptyValue, waitTime, shouldPreventSwitch } = params;
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (this, ...args: any) {
      // if (!(this instanceof AutoSwitchService)) {
      //   throw new Error(
      //     "AutoSwitch can only work on CoinService and it's sub class"
      //   );
      // }
      return loop(
        this,
        serviceType,
        method,
        args,
        emptyValue,
        0,
        shouldPreventSwitch ?? isInternetUnreachable,
        propertyKey,
        waitTime,
      );
    };
  };
}

/**
 * @deprecated
 */
export abstract class AutoSwitchService<C, T> {
  private _instanceList: T[];
  private _currRequestIndex = 0;
  private _currInstance: T;
  protected configs: C[];

  constructor(params: { configs: C[] }) {
    const { configs } = params;
    if (!configs || configs.length < 1) {
      throw new Error("empty configs");
    }
    this.configs = configs;
    this._instanceList = this.getInstanceList(configs);
    this._currInstance = this._instanceList[0];
  }

  canSwitch() {
    return this._instanceList.length > 1;
  }

  switchToNext() {
    this._currRequestIndex =
      (this._currRequestIndex + 1) % this._instanceList.length;
    this._currInstance = this._instanceList[this._currRequestIndex];
    console.log("switchToNext", this._currRequestIndex, this.currConfig());
  }

  currInstance() {
    return this._currInstance;
  }

  currConfig(): C {
    return this.configs[this._currRequestIndex];
  }

  abstract getInstanceList(configs: C[]): T[];

  instances() {
    return this._instanceList;
  }

  async broadcast<R>(func: (instance: T) => Promise<R>) {
    return await Promise.all(
      this._instanceList.map(async (instance) => {
        return await func(instance);
      }),
    );
  }
}

function executePromise(
  hasNext: (retryTimes: number) => boolean,
  promise: Promise<any>,
  getNextPromise: (error: any, retryTimes: number) => Promise<any>,
  rootResolve: (data: any) => void,
  rootReject: (error: any, retryTimes: number) => void,
  retryTimes: number = 0,
) {
  if (promise instanceof Promise) {
    promise.then(rootResolve).catch((error) => {
      if (isNetworkError(error) && hasNext(retryTimes)) {
        const nextPromise = getNextPromise(error, retryTimes);
        executePromise(
          hasNext,
          nextPromise,
          getNextPromise,
          rootResolve,
          rootReject,
          retryTimes + 1,
        );
      } else {
        rootReject(error, retryTimes);
      }
    });
  } else {
    rootResolve(promise);
  }
}

function executeFunction<T>(
  api: T,
  method: symbol | string,
  func: any,
  args: any[],
  getNextInstance: () => T,
  hasNext: (retryTimes: number) => boolean,
) {
  const result = func.apply(api, args);
  if (result instanceof Promise) {
    return new Promise((rootResolve, rootReject) => {
      executePromise(
        hasNext,
        result,
        (error: any, retryTimes: number) => {
          console.log(
            `AutoSwitchProxy [${retryTimes}] ${method.toString()} switch to next due to: ${error}`,
          );
          const nextApi = getNextInstance();
          return func.apply(nextApi, args);
        },
        rootResolve,
        (error: any, retryTimes: number) => {
          console.log(
            `AutoSwitchProxy ${method.toString()} failed with ${retryTimes} times retry: ${
              (error as Error).message
            }`,
          );
          rootReject(error);
        },
      );
    });
  }
  return result;
}

export type AutoSwitchProxy<C, T> = T & {
  // curr instance's config
  proxyCurrConfig: () => C;
  // curr raw instance
  proxyCurrInstance: () => T;
  // all raw instances
  proxyAllInstances: () => T[];
};

/**
 *
 * @param configs C
 * @param createInstance T, T can't use proxyCurrConfig proxyCurrInstance proxyAllInstances
 * @returns AutoSwitchProxy<C, T>
 *
 */
export const createAutoSwitchApi = <C, T extends object>(
  configs: C[],
  createInstance: (config: C) => T,
): AutoSwitchProxy<C, T> => {
  if (configs.length === 0) {
    throw new Error("createAutoSwitchApi need configs array greater than 0");
  }
  const instances = configs.map((config) => createInstance(config));
  let currIndex = 0;

  // won't directly access proxyInstance's property
  const proxyInstance = instances[0];

  const haveNext = (retryTimes: number) => {
    return retryTimes < instances.length + 1;
  };

  const getNextInstance = () => {
    currIndex = (currIndex + 1) % instances.length;
    return instances[currIndex];
  };

  const getCurrInstance = () => {
    return instances[currIndex];
  };

  const getCurrConfig = () => {
    return configs[currIndex];
  };

  const getAllInstances = () => {
    return [...instances];
  };

  const proxy = new Proxy(proxyInstance, {
    get(_, prop: string | symbol) {
      if (prop === "proxyCurrConfig") {
        return getCurrConfig;
      }
      if (prop === "proxyCurrInstance") {
        return getCurrInstance;
      }
      if (prop === "proxyAllInstances") {
        return getAllInstances;
      }

      const instance = getCurrInstance();
      const originalValue = Reflect.get(instance, prop);
      if (typeof originalValue === "function") {
        return function (...args: any[]) {
          return executeFunction(
            instance,
            prop,
            originalValue,
            args,
            getNextInstance,
            haveNext,
          );
        };
      }
      return originalValue;
    },
  });

  return proxy as AutoSwitchProxy<C, T>;
};
