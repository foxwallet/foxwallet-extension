// 整数部分加逗号, 保留2位小数
export const commaCurrency = (num: any): string => {
  return commaToFixed(num, 2);
};

function noExponents(num: any) {
  const data = String(num).split(/[eE]/);
  if (data.length === 1) return data[0]; // Not in scientific notation

  let z = "";
  const sign = num < 0 ? "-" : "";
  const str = data[0].replace(".", "");
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
}

// 整数部分加逗号, 保留x位小数, 不做四舍五入
export const commaToFixed = (num: any, toFix: number): string => {
  const numNoExponent = noExponents(num);
  const [integerPart, decimalPart] = String(numNoExponent).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (decimalPart) {
    const formattedDecimal = decimalPart.slice(0, toFix);
    return `${formattedInteger}.${formattedDecimal}`;
  }
  return `${formattedInteger}.00`;
};

// 整数部分加逗号, 不对小数部分处理
export const commaInteger = (num: any): string => {
  const num2 = noExponents(num);
  const [integerPart, decimalPart] = String(num2).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formattedInteger}${decimalPart ? `.${decimalPart}` : ""}`;
};
