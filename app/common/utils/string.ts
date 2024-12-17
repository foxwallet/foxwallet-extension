import { type TokenV2 } from "core/types/Token";

export const serializeToken = (token: TokenV2) => {
  return JSON.stringify(token, null);
};
