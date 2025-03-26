export function JSONStringifyWithBigInt(obj: any) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value,
  );
}

export function JSONParseWithBigInt(jsonString: string) {
  return JSON.parse(jsonString, (key, value) => {
    // Check if the value ends with 'n' and is a valid BigInt representation
    if (typeof value === "string" && value.endsWith("n")) {
      const bigIntValue = value.slice(0, -1);
      if (/^-?\d+$/.test(bigIntValue)) {
        return BigInt(bigIntValue);
      }
    }
    return value;
  });
}

export function JSONStringifyOmitBigInt(obj: any) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}
