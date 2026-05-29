import { isComplianceProgram } from "core/coins/ALEO/constants";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { type TokenV2 } from "core/types/Token";

const getAleoProgramId = (token: TokenV2): string | undefined => {
  if (token.programId) {
    return token.programId;
  }
  if (token.contractAddress) {
    const [programId] = token.contractAddress.split("-");
    return programId || undefined;
  }
  return undefined;
};

export const dedupeUserTokens = (
  uniqueId: ChainUniqueId,
  tokens: TokenV2[],
): TokenV2[] => {
  if (uniqueId !== InnerChainUniqueId.ALEO_MAINNET) {
    return tokens;
  }
  const ordered = [...tokens].sort((a, b) => {
    const aHasIcon = a.icon ? 1 : 0;
    const bHasIcon = b.icon ? 1 : 0;
    return bHasIcon - aHasIcon;
  });
  const seenComplianceProgramIds = new Set<string>();
  const out: TokenV2[] = [];
  for (const t of ordered) {
    const programId = getAleoProgramId(t);
    if (programId && isComplianceProgram(programId)) {
      const key = programId.toLowerCase();
      if (seenComplianceProgramIds.has(key)) {
        continue;
      }
      seenComplianceProgramIds.add(key);
    }
    out.push(t);
  }
  return out;
};
