import { BigNumber } from "ethers";

export const add = (...params: string[]): BigNumber => {
  let result = BigNumber.from(0);
  try {
    for (const param of params) {
      result = result.add(BigNumber.from(param));
    }
    return result;
  } catch (err) {
    console.log("BigNumber add:", err);
    return BigNumber.from(0);
  }
};

export const mul = (...params: string[]): BigNumber => {
  let result = BigNumber.from(1);
  try {
    for (const param of params) {
      result = result.mul(BigNumber.from(param));
    }
    return result;
  } catch (err) {
    console.log("BigNumber mul:", err);
    return BigNumber.from(0);
  }
};
