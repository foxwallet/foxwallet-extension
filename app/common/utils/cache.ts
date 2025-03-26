import { getStorageData, setStorageData } from "@/common/utils/storage";

export enum CacheType {
  STRING,
  MAP,
  ARRAY,
}

type CacheData = { data: any; expiredAt: number };

const isValidData = (cacheType: CacheType, data: any): boolean => {
  switch (cacheType) {
    case CacheType.STRING: {
      return typeof data === "string";
    }
    case CacheType.MAP: {
      return (
        typeof data === "object" &&
        Object.prototype.toString.call(data) === "[object Object]"
      );
    }
    case CacheType.ARRAY: {
      return (
        typeof data === "object" &&
        Object.prototype.toString.call(data) === "[object Array]"
      );
    }
  }
};

const isValidCache = (cacheType: CacheType, { data, expiredAt }: CacheData) => {
  return Date.now() < expiredAt && isValidData(cacheType, data);
};

export const defaultCacheKeyGenerator = (...params: any[]): string => {
  if (!params || params.length === 0) {
    return "";
  }
  return params.join("-");
};

export function Cache<T>(params: {
  cacheType: CacheType;
  cacheKeyGenerator: (...args: any[]) => string;
  maxAge: number; // 多少秒后过期
}) {
  const { cacheType, cacheKeyGenerator, maxAge } = params;
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const finalCacheKeyGenerator =
      cacheKeyGenerator || defaultCacheKeyGenerator;

    descriptor.value = async function (this, ...args: any) {
      const cacheKey = finalCacheKeyGenerator(...args);
      try {
        const cache: CacheData | undefined =
          await getStorageData<CacheData>(cacheKey);
        console.log("Data loaded:", cache);

        if (cache && isValidCache(cacheType, cache)) {
          console.log(`@Cache hit for key: ${cacheKey}`);
          return cache.data as T;
        } else {
          console.log(
            cache
              ? `@Cache expired for key: ${cacheKey}`
              : `@Cache miss for key: ${cacheKey}`,
          );
        }
        const res = await method.apply(this, args);
        if (res) {
          if (isValidData(cacheType, res)) {
            try {
              await setStorageData(cacheKey, {
                data: res,
                expiredAt: Date.now() + maxAge * 1000,
              });
              console.log("Data saved successfully");
            } catch (error) {
              console.error("Error saving data:", error);
            }
          } else {
            console.log(`@Cache invalid response data for ${cacheKey} ${res}`);
          }
        }
        return res;
      } catch (error) {
        console.error(`Error accessing cache for key: ${cacheKey}`, error);
        throw error;
      }
    };
  };
}

export function withCache<Args extends any[], T>(params: {
  cacheType: CacheType;
  cacheKeyGenerator: (...args: Args) => string;
  maxAge: number;
}) {
  const {
    cacheType,
    cacheKeyGenerator = defaultCacheKeyGenerator,
    maxAge,
  } = params;

  return (func: (...args: Args) => Promise<T>) => {
    return async function (...args: Args): Promise<T> {
      const cacheKey = cacheKeyGenerator(...args);
      try {
        const cache: CacheData | undefined =
          await getStorageData<CacheData>(cacheKey);
        console.log("Data loaded:", cache);

        if (cache && isValidCache(cacheType, cache)) {
          console.log(`@Cache hit for key: ${cacheKey}`);
          return cache.data as T;
        } else {
          console.log(
            cache
              ? `@Cache expired for key: ${cacheKey}`
              : `@Cache miss for key: ${cacheKey}`,
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }

      const result = await func(...args);
      if (result && isValidData(cacheType, result)) {
        try {
          await setStorageData(cacheKey, {
            data: result,
            expiredAt: Date.now() + maxAge * 1000,
          });
          console.log("Data saved successfully");
        } catch (error) {
          console.error("Error saving data:", error);
        }
      }
      return result;
    };
  };
}
