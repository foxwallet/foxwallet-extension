export const parseU64 = (value: string): bigint => {
  if (!value) {
    return 0n;
  }
  try {
    const numStr = value.split(".")[0];
    return BigInt(numStr.slice(0, -3));
  } catch (err) {
    console.error("===> parseU64 error: ", err);
    return 0n;
  }
};

export const parseU128 = (value: string): bigint => {
  if (!value) {
    return 0n;
  }
  try {
    const numStr = value.split(".")[0];
    return BigInt(numStr.slice(0, -4));
  } catch (err) {
    console.error("===> parseU128 error: ", err);
    return 0n;
  }
};
