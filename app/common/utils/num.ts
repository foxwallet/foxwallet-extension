import { BigNumberish, BigNumber, utils } from "ethers";

export const formatTokenNum = (
  num: BigNumberish | undefined,
  decimals: number,
  precision?: number,
  commify: boolean = false,
  placeHolder: string = "",
  symbol?: string,
): string => {
  if (num === undefined) {
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
    console.error(
      "===> error formatTokenNum",
      e,
      num,
      decimals,
      precision,
      commify,
      placeHolder,
      symbol,
    );
    return placeHolder;
  }
};
