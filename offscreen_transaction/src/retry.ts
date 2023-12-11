import type { AutoSwitchServiceType } from "./types";
import { sleep } from "./sleep";

export const isNetworkError = (err: any) => {
  if (err?.message && typeof err.message === "string") {
    const msg = err.message;
    return msg === "Network Error" || msg.startsWith("network error");
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

export const getServiceNameByType = (type: AutoSwitchServiceType) => {
  return `${type}Service`;
};

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

  async broadcast<R>(func: (instance: T) => Promise<R>) {
    return await Promise.all(
      this._instanceList.map(async (instance) => {
        return await func(instance);
      }),
    );
  }
}
