import { createModel } from "@rematch/core";
import { type RootModel } from "./index";
import {
  type DisplayWalletV1,
  type DisplayAccountV1,
} from "@/scripts/background/store/vault/types/keyringV1";
import { CoinType } from "core/types";
import { DEFAULT_CHAIN_UNIQUE_ID } from "core/constants/chain";
import { type ChainUniqueId } from "core/types/ChainUniqueId";

type SelectedAccount = DisplayAccountV1 & {
  walletId: string;
  coinType: CoinType;
};

type WalletBackupedMnemonicMap = { [walletId in string]: boolean };

type WalletInfoMap = { [walletId in string]: DisplayWalletV1 };

interface AccountModel {
  selectedAccount: SelectedAccount;
  selectedUniqueId: ChainUniqueId;
  walletBackupMnemonicMap: WalletBackupedMnemonicMap;
  allWalletInfo: WalletInfoMap;
  showBalance: boolean;
}

export const DEFAULT_ACCOUNT_MODEL_V1: AccountModel = {
  selectedAccount: {
    accountId: "",
    accountName: "",
    address: "",
    index: 0,
    walletId: "",
    coinType: CoinType.ALEO,
  },
  selectedUniqueId: DEFAULT_CHAIN_UNIQUE_ID[CoinType.ALEO],
  walletBackupMnemonicMap: {},
  allWalletInfo: {},
  showBalance: true,
};

/**
 * @deprecated
 */
export const account = createModel<RootModel>()({
  name: "account",
  state: {
    ...DEFAULT_ACCOUNT_MODEL_V1,
  },
});
