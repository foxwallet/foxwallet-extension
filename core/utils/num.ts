import { BigNumber, type BigNumberish, utils } from "ethers";

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

export const formatValueNum = (
  num: BigNumberish | undefined,
  decimals: number,
  precision = decimals,
  commify: boolean = false,
  placeHolder: string = "",
  symbol?: string,
): string => {
  if (!num) {
    return placeHolder;
  }
  try {
    const n = BigNumber.from(num);
    if (n.eq(0)) {
      if (symbol) {
        return `0 ${symbol}`;
      }
      return "0";
    }
    if (!precision || precision > decimals) {
      precision = decimals >= 8 ? 4 : Math.floor(decimals / 2);
    }
    const remainder = n.mod(BigNumber.from(10).pow(decimals - precision));
    let numStr = utils.formatUnits(n.sub(remainder), decimals);
    numStr = commify ? utils.commify(numStr) : numStr;
    if (symbol) {
      numStr = `${numStr} ${symbol}`;
    }
    return numStr;
  } catch (e) {
    console.log("error formatUnits", e, num);
    return placeHolder;
  }
};

export const formatGasStr = (
  symbol: string,
  num: BigNumber | undefined,
  decimals: number,
) => {
  const precision = decimals >= 8 ? 8 : Math.max(Math.floor(decimals / 2), 4);
  return formatValueNum(num, decimals, precision, true, "----", symbol);
};
