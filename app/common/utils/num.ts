import { type BigNumberish, BigNumber, utils } from "ethers";

export const formatTokenNum = (
  num: bigint | undefined,
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
      // precision = decimals >= 8 ? 4 : 0; // todo
      precision = 4;
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

export const formatPrice = (price: number | string | undefined): string => {
  try {
    if (price === 0) {
      return "0";
    }
    // 对于 "" NaN undefined 的情况返回
    if (!price) {
      console.log("formatRatePrice", price);
      return "---";
    }

    let fixedNum = 2;
    const decimalNum = String(price).split(".")[1];
    if (decimalNum) {
      const dec2IntStr = String(parseInt(decimalNum, 10));
      fixedNum = Math.max(
        2,
        decimalNum.length -
          dec2IntStr.length +
          (dec2IntStr.charAt(1) === "0" ? 1 : 2),
      );
    }

    const formatPrice = typeof price === "string" ? parseFloat(price) : price;
    return formatPrice.toFixed(fixedNum);
  } catch (err) {
    console.log("failed formatRatePrice", price, err);
    return "---";
  }
};
