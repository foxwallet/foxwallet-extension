import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { INNER_ALEO_CONFIG } from "core/coins/ALEO/config/chains";
import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import { CoinType } from "core/types";
import { ChainBaseConfig } from "core/types/ChainBaseConfig";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AccountOption } from "core/types/CoinBasic";

export const chainUniqueIdToCoinType = (uniqueId: ChainUniqueId): CoinType => {
  switch (uniqueId) {
    case InnerChainUniqueId.ALEO_TESTNET:
      return CoinType.ALEO;
    case InnerChainUniqueId.ALEO_MAINNET:
      return CoinType.ALEO;
    default: {
      throw new Error("unknown uniqueId: " + uniqueId);
    }
  }
};

export const chainUniqueIdToAccountOptions = (
  uniqueId: ChainUniqueId,
  walletType: WalletType,
): Array<AccountOption[CoinType]> => {
  switch (uniqueId) {
    case InnerChainUniqueId.ALEO_TESTNET:
      return [DEFAULT_ALEO_ACCOUNT_OPTION];
    default: {
      throw new Error("unknown uniqueId: " + uniqueId);
    }
  }
};

export const INNER_CHAIN_CONFIG: ChainBaseConfig[] = [...INNER_ALEO_CONFIG];
