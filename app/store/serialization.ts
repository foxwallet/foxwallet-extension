// Chrome ports use JSON. Tag every container so user data cannot collide with
// bigint/undefined markers, and keep small bigint values (including 0n) intact.
type WireValue =
  | string
  | number
  | boolean
  | null
  | ["bigint", string]
  | ["undefined"]
  | ["array", WireValue[]]
  | ["object", Array<[string, WireValue]>];
function encode(value: unknown): WireValue {
  if (value === undefined) return ["undefined"];
  if (typeof value === "bigint") return ["bigint", value.toString()];
  if (Array.isArray(value)) return ["array", value.map(encode)];
  if (value !== null && typeof value === "object")
    return [
      "object",
      Object.entries(value).map(([key, item]) => [key, encode(item)]),
    ];
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  )
    return value;
  throw new Error("Unsupported state value");
}
function decode(value: WireValue): unknown {
  if (!Array.isArray(value)) return value;
  switch (value[0]) {
    case "bigint":
      return BigInt(value[1]);
    case "undefined":
      return undefined;
    case "array":
      return value[1].map(decode);
    case "object":
      return Object.fromEntries(
        value[1].map(([key, item]) => [key, decode(item)]),
      );
  }
}
export const serializeState = (value: unknown): string =>
  JSON.stringify(encode(value));
export const deserializeState = <T>(value: string): T =>
  decode(JSON.parse(value)) as T;
export const STORE_PORT = "foxwallet:redux:v1";
