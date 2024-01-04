import {
  createAccountSettingStorage,
  createDappHistoryStorage,
} from "@/common/utils/indexeddb";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConnectHistory } from "../../types/connect";
import { uniqBy } from "lodash";
import { DappRequest } from "../../types/dapp";
import { CoinType } from "core/types";
import { DisplayAccount, SelectedAccount } from "../vault/types/keyring";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { DEFAULT_UNIQUE_ID_MAP } from "core/constants";

const SELECTED_ACCOUNT_KEY = "selectedAccount";
const SELECTED_UNIQUE_ID_KEY = "selectedUniqueId";

export class AccountSettingStorage {
  static instance: AccountSettingStorage;
  #accountSettingMap: Map<CoinType, LocalForage>;

  static getInstance() {
    if (!AccountSettingStorage.instance) {
      AccountSettingStorage.instance = new AccountSettingStorage();
    }
    return AccountSettingStorage.instance;
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
    return selectedUniqueId ?? DEFAULT_UNIQUE_ID_MAP[coinType];
  };

  setSelectedUniqueId = async (uniqueId: InnerChainUniqueId) => {
    const coinType = chainUniqueIdToCoinType(uniqueId);
    const instance = this.getAccountSettingInstance(coinType);
    return await instance.setItem(SELECTED_UNIQUE_ID_KEY, uniqueId);
  };
}
