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
