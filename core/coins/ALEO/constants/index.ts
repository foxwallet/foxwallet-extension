export const ALEO_PRIVATE_PREFIX = "APrivateKey1";

export const NATIVE_TOKEN_PROGRAM_ID = "credits.aleo";

export const NATIVE_TOKEN_TOKEN_ID = "__NATIVE_TOKEN__";

export const BETA_STAKING_ALEO_TOKEN_ID = "__BETA_STAKING_ALEO_TOKEN__";

export const LOCAL_TX_EXPIRE_TIME = 1000 * 60 * 10;

export const FAILED_TX_REMOVE_TIME = 1000 * 60 * 60 * 24;

export const SPLIT_RECORD_FEE = "0.01";

export const ALPHA_TOKEN_PROGRAM_ID = "alphaswap.aleo";

export const BETA_STAKING_PROGRAM_ID = "betastaking.aleo";

export const TOKEN_REGISTRY_PROGRAM_ID = "token_registry.aleo";

export const ARCANE_PROGRAM_ID = "token_registry.aleo";

export const USAD_STABLECOIN_PROGRAM_ID = "usad_stablecoin.aleo";

export const USDCX_STABLECOIN_PROGRAM_ID = "usdcx_stablecoin.aleo";

export const COMPLIANCE_PROGRAM_IDS: readonly string[] = [
  USAD_STABLECOIN_PROGRAM_ID,
  USDCX_STABLECOIN_PROGRAM_ID,
];

export const isComplianceProgram = (programId: string): boolean => {
  return COMPLIANCE_PROGRAM_IDS.includes(programId);
};

export const COMPLIANCE_BALANCES_MAPPING_NAME = "balances";
