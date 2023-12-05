import {
  createAccountSettingStorage,
  createDappHistoryStorage,
} from "@/common/utils/indexeddb";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConnectHistory } from "../../types/connect";
import { uniqBy } from "lodash";
import { DappRequest } from "../../types/dapp";
import { CoinType } from "core/types";
import { DisplayAccount, SelectedAccount } from "../vault/types/keyring";

const SELECTED_ACCOUNT_KEY = "selectedAccount";

export class AccountSettingStorage {
  #accountSettingMap: Map<CoinType, LocalForage>;

  constructor() {
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

  getSelectedAccount = async (coinType: CoinType) => {
    const instance = this.getAccountSettingInstance(coinType);
    const selectedAccount: SelectedAccount | null =
      await instance.getItem(SELECTED_ACCOUNT_KEY);
    return selectedAccount;
  };
}
