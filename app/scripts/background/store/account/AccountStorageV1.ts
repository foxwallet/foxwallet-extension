import { createAccountSettingStorage } from "@/common/utils/indexeddb";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";
import { CoinType } from "core/types";
import { SelectedAccount } from "../vault/types/keyringV1";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { DEFAULT_CHAIN_UNIQUE_ID } from "core/constants/chain";

const SELECTED_ACCOUNT_KEY = "selectedAccount";
const SELECTED_UNIQUE_ID_KEY = "selectedUniqueId";

export class AccountSettingStorageV1 {
  static instance: AccountSettingStorageV1;
  #accountSettingMap: Map<CoinType, LocalForage>;

  static getInstance() {
    if (!AccountSettingStorageV1.instance) {
      AccountSettingStorageV1.instance = new AccountSettingStorageV1();
    }
    return AccountSettingStorageV1.instance;
  }

  private constructor() {
    this.#accountSettingMap = new Map();
  }

  getAccountSettingInstance = (coinType: CoinType) => {
    const existInstance = this.#accountSettingMap.get(coinType);
    if (existInstance) {
      return existInstance;
    }
    const newInstance = createAccountSettingStorage(coinType);
    this.#accountSettingMap.set(coinType, newInstance);
    return newInstance;
  };

  setSelectedAccount = async (account: SelectedAccount) => {
    const instance = this.getAccountSettingInstance(account.coinType);
    return await instance.setItem(SELECTED_ACCOUNT_KEY, account);
  };

  removeSelectedAccount = async (coinType: CoinType) => {
    const instance = this.getAccountSettingInstance(coinType);
    return await instance.removeItem(SELECTED_ACCOUNT_KEY);
  };

  getSelectedAccount = async (coinType: CoinType) => {
    const instance = this.getAccountSettingInstance(coinType);
    const selectedAccount: SelectedAccount | null =
      await instance.getItem(SELECTED_ACCOUNT_KEY);
    return selectedAccount;
  };

  getSelectedUniqueId = async (coinType: CoinType) => {
    const instance = this.getAccountSettingInstance(coinType);
    const selectedUniqueId: ChainUniqueId | null = await instance.getItem(
      SELECTED_UNIQUE_ID_KEY,
    );
    return selectedUniqueId ?? DEFAULT_CHAIN_UNIQUE_ID[coinType];
  };

  setSelectedUniqueId = async (uniqueId: InnerChainUniqueId) => {
    const coinType = chainUniqueIdToCoinType(uniqueId);
    const instance = this.getAccountSettingInstance(coinType);
    return await instance.setItem(SELECTED_UNIQUE_ID_KEY, uniqueId);
  };
}
