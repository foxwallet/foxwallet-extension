import { CoinType } from "core/types";
import { walletStorageInstance } from "../../../../common/utils/localstorage";
import {
  AccountMethod,
  AleoSyncAccount,
  Cipher,
  HDWallet,
  KeyringObj,
  Vault,
  VaultKeys,
  WalletType,
} from "./types/keyring";
import browser from "webextension-polyfill";
import { aleoAccountStorageInstance } from "@/common/utils/indexeddb";
import { TaskPriority } from "../../../../../offscreen/aleo.di";

export class VaultStorage {
  #storage: browser.Storage.LocalStorageArea;
  #aleoStorage: LocalForage;

  constructor() {
    this.#storage = walletStorageInstance;
    this.#aleoStorage = aleoAccountStorageInstance;
  }

  async getCipher() {
    const store = (await this.#storage.get(VaultKeys.cipher)) as {
      cipher?: Cipher;
    };
    return store?.cipher;
  }

  // only called when initPassword
  async initCipher(cipher: Cipher) {
    const store: Vault = {
      cipher,
      keyring: {},
    };
    return await this.setVault(store);
  }

  async getKeyring() {
    const store = (await this.#storage.get(VaultKeys.keyring)) as {
      keyring?: KeyringObj;
    };
    return store?.keyring;
  }

  async setKeyring(keyring: KeyringObj) {
    const vault = await this.getVault();
    const store: Vault = {
      ...vault,
      keyring,
    };
    return await this.setVault(store);
  }

  async getHDWallet(walletId: string) {
    const keyring = (await this.getKeyring()) || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const hdWallet = hdWallets.find((item) => item.walletId === walletId);
    if (!hdWallet) {
      throw new Error("HDWallet not exists " + walletId);
    }
    return hdWallet;
  }

  async isHDWalletExist(walletId: string) {
    const keyring = (await this.getKeyring()) || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const hdWallet = hdWallets.find((item) => item.walletId === walletId);
    return !!hdWallet;
  }

  async addHDWallet(newHdWallet: HDWallet, method: AccountMethod) {
    const keyring = (await this.getKeyring()) || {};
    const hdWallets = keyring[WalletType.HD] || [];
    if (hdWallets.some((item) => item.walletId === newHdWallet.walletId)) {
      throw new Error("HDWallet already exists");
    }
    const newHdWallets = [...hdWallets, newHdWallet];
    await this.setKeyring({
      ...keyring,
      [WalletType.HD]: newHdWallets,
    });
    switch (method) {
      case AccountMethod.CREATE: {
        const aleoAccount = newHdWallet.accountsMap[CoinType.ALEO][0];
        if (aleoAccount) {
          const otherAccounts = await this.#aleoStorage.keys();
          for (const otherAccount of otherAccounts) {
            const info = (await this.#aleoStorage.getItem(
              otherAccount,
            )) as AleoSyncAccount;
            await this.#aleoStorage.setItem(otherAccount, {
              ...info,
              priority: TaskPriority.LOW,
            });
          }

          const item: AleoSyncAccount = {
            walletId: newHdWallet.walletId,
            accountId: aleoAccount.accountId,
            address: aleoAccount.address,
            viewKey: aleoAccount.viewKey,
            priority: TaskPriority.MEDIUM,
            timestamp: Date.now(),
          };

          this.#aleoStorage.setItem(aleoAccount.address, item);
        }
        break;
      }
      case AccountMethod.IMPORT: {
        const aleoAccount = newHdWallet.accountsMap[CoinType.ALEO][0];
        if (aleoAccount) {
          const otherAccounts = await this.#aleoStorage.keys();
          for (const otherAccount of otherAccounts) {
            const info = (await this.#aleoStorage.getItem(
              otherAccount,
            )) as AleoSyncAccount;
            await this.#aleoStorage.setItem(otherAccount, {
              ...info,
              priority: TaskPriority.LOW,
            });
          }

          const item: AleoSyncAccount = {
            walletId: newHdWallet.walletId,
            accountId: aleoAccount.accountId,
            viewKey: aleoAccount.viewKey,
            address: aleoAccount.address,
            priority: TaskPriority.MEDIUM,
          };
          this.#aleoStorage.setItem(aleoAccount.address, item);
        }
        break;
      }
    }
  }

  async setHDWallet(hdWallet: HDWallet, method: AccountMethod) {
    const keyring = (await this.getKeyring()) || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const oldWalletIndex = hdWallets.findIndex(
      (item) => item.walletId === hdWallet.walletId,
    );
    if (oldWalletIndex > -1) {
      const oldWallet = hdWallets[oldWalletIndex];
      hdWallets[oldWalletIndex] = hdWallet;
      await this.setKeyring({
        ...keyring,
        [WalletType.HD]: [...hdWallets],
      });
      switch (method) {
        case AccountMethod.REGENERATE: {
          const oldAccount = oldWallet.accountsMap[CoinType.ALEO][0];
          if (oldAccount) {
            await this.#aleoStorage.removeItem(oldAccount.address);
          }
          const aleoAccount = hdWallet.accountsMap[CoinType.ALEO][0];
          if (aleoAccount) {
            const otherAccounts = await this.#aleoStorage.keys();
            for (const otherAccount of otherAccounts) {
              const info = (await this.#aleoStorage.getItem(
                otherAccount,
              )) as AleoSyncAccount;
              await this.#aleoStorage.setItem(otherAccount, {
                ...info,
                priority: TaskPriority.LOW,
              });
            }
            const item: AleoSyncAccount = {
              walletId: hdWallet.walletId,
              accountId: aleoAccount.accountId,
              viewKey: aleoAccount.viewKey,
              address: aleoAccount.address,
              priority: TaskPriority.MEDIUM,
              timestamp: Date.now(),
            };

            await this.#aleoStorage.setItem(aleoAccount.address, item);
          }
          break;
        }
        case AccountMethod.ADD: {
          const length = hdWallet.accountsMap[CoinType.ALEO].length;
          const aleoAccount = hdWallet.accountsMap[CoinType.ALEO][length - 1];
          if (aleoAccount) {
            const otherAccounts = await this.#aleoStorage.keys();
            for (const otherAccount of otherAccounts) {
              const info = (await this.#aleoStorage.getItem(
                otherAccount,
              )) as AleoSyncAccount;
              await this.#aleoStorage.setItem(otherAccount, {
                ...info,
                priority: TaskPriority.LOW,
              });
            }

            const item: AleoSyncAccount = {
              walletId: hdWallet.walletId,
              accountId: aleoAccount.accountId,
              viewKey: aleoAccount.viewKey,
              address: aleoAccount.address,
              priority: TaskPriority.MEDIUM,
            };
            await this.#aleoStorage.setItem(aleoAccount.address, item);
          }
          break;
        }
      }
    }
  }

  async getVault() {
    return (await this.#storage.get(null)) as Vault;
  }

  async setVault(vault: Vault) {
    return await this.#storage.set(vault);
  }
}

export const vaultStorage = new VaultStorage();
