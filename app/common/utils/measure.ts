function callFunc(
  obj: any,
  name: string,
  timeMapName: string,
  method: any,
  args: any[],
): any {
  const map = obj[timeMapName];
  const startTime = performance.now();
  try {
    return method.apply(obj, args);
  } finally {
    const endTime = performance.now();
    if (map) {
      const existMeasure = map[name];
      if (existMeasure) {
        const { time, count } = existMeasure;
        map[name].time = (time + endTime - startTime) / 2;
        map[name].count = count + 1;
        map[name].max = Math.max(time, endTime - startTime);
      } else {
        map[name] = {};
        map[name].time = endTime - startTime;
        map[name].count = 1;
        map[name].max = endTime - startTime;
      }
    }
  }
}

export function Measure(
  name?: string,
  enableName?: string,
  timeMapName?: string,
) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = function (this: any, ...args: any) {
      const enable = this[enableName ?? "enableMeasure"];
      if (enable) {
        return callFunc(
          this,
          name ?? propertyKey,
          timeMapName ?? "measureMap",
          method,
          args,
        );
      } else {
        return method.apply(this, args);
      }
    };
  };
}

async function callAsyncFunc(
  obj: any,
  name: string,
  timeMapName: string,
  method: any,
  args: any[],
): Promise<any> {
  const map = obj[timeMapName];
  const startTime = performance.now();
  try {
    return await method.apply(obj, args);
  } finally {
    const endTime = performance.now();
    if (map) {
      const existMeasure = map[name];
      if (existMeasure) {
        const { time, count } = existMeasure;
        map[name].time = (time + endTime - startTime) / 2;
        map[name].count = count + 1;
        map[name].max = Math.max(time, endTime - startTime);
      } else {
        map[name] = {};
        map[name].time = endTime - startTime;
        map[name].count = 1;
        map[name].max = endTime - startTime;
      }
    }
  }
}

export function MeasureAsync(
  name?: string,
  enableName?: string,
  timeMapName?: string,
) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (this: any, ...args: any) {
      const enable = this[enableName ?? "enableMeasure"];
      if (enable) {
        return callAsyncFunc(
          this,
          name ?? propertyKey,
          timeMapName ?? "measureMap",
          method,
          args,
        );
      } else {
        return method.apply(this, args);
      }
    };
  };
}
