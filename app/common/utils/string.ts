import { Token } from "core/coins/ALEO/types/Token";

export const serializeToken = (token: Token) => {
  const { tokenId, name, symbol, decimals, logo, official, programId } = token;
  return JSON.stringify({
    tokenId,
    name,
    symbol,
    decimals,
    logo,
    official,
    programId,
  });
};
