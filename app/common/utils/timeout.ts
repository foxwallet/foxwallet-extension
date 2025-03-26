import { HTTP_REQUEST_TIMEOUT } from "@/common/constants";
import { HttpError, HttpErrorType } from "@/common/types/error";

export const timeout = async (time: number = 300) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

export function Timeout({
  canThrow,
  duration,
}: {
  canThrow: boolean;
  duration: number;
}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const finalDuration = duration || HTTP_REQUEST_TIMEOUT;

    descriptor.value = async function (this, ...args: any) {
      const racePromise = new Promise<HttpError>((resolve) => {
        setTimeout(() => {
          resolve(new HttpError(HttpErrorType.TIMEOUT));
        }, finalDuration);
      });
      const methodRes = method.apply(this, args);
      if (methodRes instanceof Promise) {
        const res = await Promise.race([methodRes, racePromise]);
        if (res instanceof HttpError) {
          if (canThrow) {
            throw res;
          } else {
            console.error(method.name, " timeout");
            return undefined;
          }
        }
        return res;
      }
      return methodRes;
    };
  };
}
