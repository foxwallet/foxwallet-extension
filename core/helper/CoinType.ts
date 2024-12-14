import { type WalletType } from "@/scripts/background/store/vault/types/keyring";
import { INNER_ALEO_CONFIG } from "core/coins/ALEO/config/chains";
import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import { CoinType } from "core/types";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import {
  type ChainUniqueId,
  EthRpcPrefix,
  InnerChainUniqueId,
  InnerChainUniqueIdValues,
} from "core/types/ChainUniqueId";
import { type AccountOption } from "core/types/CoinBasic";
import { DEFAULT_ETH_ACCOUNT_OPTION } from "core/coins/ETH/config/derivation";
import { INNER_ETH_CONFIG } from "core/coins/ETH/config/chains";

export const chainUniqueIdToCoinType = (uniqueId: ChainUniqueId): CoinType => {
  switch (uniqueId) {
    // case InnerChainUniqueId.ALEO_TESTNET:
    //   return CoinType.ALEO;
    case InnerChainUniqueId.ALEO_MAINNET:
      return CoinType.ALEO;
    default: {
      if (InnerChainUniqueIdValues.includes(uniqueId as InnerChainUniqueId)) {
        return CoinType.ETH;
      }
      if (uniqueId.startsWith(EthRpcPrefix)) {
        return CoinType.ETH;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      throw new Error("unknown uniqueId: " + uniqueId);
    }
  }
};

export const chainUniqueIdToAccountOptions = (
  uniqueId: ChainUniqueId,
  walletType: WalletType,
): Array<AccountOption[CoinType]> => {
  switch (uniqueId) {
    case InnerChainUniqueId.ALEO_MAINNET:
      return [DEFAULT_ALEO_ACCOUNT_OPTION];
    default: {
      if (InnerChainUniqueIdValues.includes(uniqueId as InnerChainUniqueId)) {
        return [DEFAULT_ETH_ACCOUNT_OPTION];
      }
      if (uniqueId.startsWith(EthRpcPrefix)) {
        return [DEFAULT_ETH_ACCOUNT_OPTION];
      }
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      throw new Error("unknown uniqueId: " + uniqueId);
    }
  }
};

export const INNER_CHAIN_CONFIG: ChainBaseConfig[] = [
  ...INNER_ALEO_CONFIG,
  ...INNER_ETH_CONFIG,
];
