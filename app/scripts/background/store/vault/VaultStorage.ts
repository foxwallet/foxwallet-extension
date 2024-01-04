import { CoinType } from "core/types";
import { walletStorageInstance } from "../../../../common/utils/localstorage";
import {
  AccountMethod,
  Cipher,
  HDWallet,
  KeyringObj,
  SimpleWallet,
  Vault,
  VaultKeys,
  WalletType,
} from "./types/keyring";
import browser from "webextension-polyfill";
import { TaskPriority } from "core/coins/ALEO/types/SyncTask";
import { AleoStorage } from "../aleo/AleoStorage";
import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";

export class VaultStorage {
  #storage: browser.Storage.LocalStorageArea;
  #aleoStorage: AleoStorage;

  constructor() {
    this.#storage = walletStorageInstance;
    this.#aleoStorage = AleoStorage.getInstance();
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

  async getSimpleWallet(walletId: string) {
    const keyring = (await this.getKeyring()) || {};
    const simpleWallets = keyring[WalletType.SIMPLE] || [];
    const simpleWallet = simpleWallets.find(
      (item) => item.walletId === walletId,
    );
    if (!simpleWallet) {
      throw new Error("simpleWallet not exists " + walletId);
    }
    return simpleWallet;
  }

  async getAllHDWallets() {
    const keyring = (await this.getKeyring()) || {};
    return keyring[WalletType.HD] || [];
  }

  async getAllSimpleWallets() {
    const keyring = (await this.getKeyring()) || {};
    return keyring[WalletType.SIMPLE] || [];
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
          const otherAccounts = await this.#aleoStorage.getAccountsAddress();
          for (const otherAccount of otherAccounts) {
            const info = await this.#aleoStorage.getAccountInfo(otherAccount);
            if (info) {
              await this.#aleoStorage.setAccountInfo({
                ...info,
                priority: TaskPriority.LOW,
              });
            }
          }
          const item: AleoSyncAccount = {
            walletId: newHdWallet.walletId,
            accountId: aleoAccount.accountId,
            address: aleoAccount.address,
            viewKey: aleoAccount.viewKey,
            priority: TaskPriority.MEDIUM,
          };
          this.#aleoStorage.setAccountInfo(item);
        }
        break;
      }
      case AccountMethod.IMPORT: {
        const aleoAccount = newHdWallet.accountsMap[CoinType.ALEO][0];
        if (aleoAccount) {
          // const otherAccounts = await this.#aleoStorage.keys();
          const otherAccounts = await this.#aleoStorage.getAccountsAddress();
          for (const otherAccount of otherAccounts) {
            const info = await this.#aleoStorage.getAccountInfo(otherAccount);
            if (info) {
              await this.#aleoStorage.setAccountInfo({
                ...info,
                priority: TaskPriority.LOW,
              });
            }
          }

          const item: AleoSyncAccount = {
            walletId: newHdWallet.walletId,
            accountId: aleoAccount.accountId,
            viewKey: aleoAccount.viewKey,
            address: aleoAccount.address,
            priority: TaskPriority.MEDIUM,
          };
          this.#aleoStorage.setAccountInfo(item);
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
            await this.#aleoStorage.removeAccount(oldAccount.address);
          }
          const aleoAccount = hdWallet.accountsMap[CoinType.ALEO][0];
          if (aleoAccount) {
            const otherAccounts = await this.#aleoStorage.getAccountsAddress();
            for (const otherAccount of otherAccounts) {
              const info = await this.#aleoStorage.getAccountInfo(otherAccount);
              if (info) {
                await this.#aleoStorage.setAccountInfo({
                  ...info,
                  priority: TaskPriority.LOW,
                });
              }
            }
            const item: AleoSyncAccount = {
              walletId: hdWallet.walletId,
              accountId: aleoAccount.accountId,
              viewKey: aleoAccount.viewKey,
              address: aleoAccount.address,
              priority: TaskPriority.MEDIUM,
            };
            this.#aleoStorage.setAccountInfo(item);
          }
          break;
        }
        case AccountMethod.ADD: {
          const length = hdWallet.accountsMap[CoinType.ALEO].length;
          const aleoAccount = hdWallet.accountsMap[CoinType.ALEO][length - 1];
          if (aleoAccount) {
            const otherAccounts = await this.#aleoStorage.getAccountsAddress();
            for (const otherAccount of otherAccounts) {
              const info = await this.#aleoStorage.getAccountInfo(otherAccount);
              if (info) {
                await this.#aleoStorage.setAccountInfo({
                  ...info,
                  priority: TaskPriority.LOW,
                });
              }
            }

            const item: AleoSyncAccount = {
              walletId: hdWallet.walletId,
              accountId: aleoAccount.accountId,
              viewKey: aleoAccount.viewKey,
              address: aleoAccount.address,
              priority: TaskPriority.MEDIUM,
            };
            this.#aleoStorage.setAccountInfo(item);
          }
          break;
        }
      }
    }
  }

  async addSimpleWallet(newSimpleWallet: SimpleWallet) {
    const keyring = (await this.getKeyring()) || {};
    const simpleWallets = keyring[WalletType.SIMPLE] || [];
    if (
      simpleWallets.some((item) => item.walletId === newSimpleWallet.walletId)
    ) {
      throw new Error("HDWallet already exists");
    }
    const newSimpleWallets = [...simpleWallets, newSimpleWallet];
    await this.setKeyring({
      ...keyring,
      [WalletType.SIMPLE]: newSimpleWallets,
    });
    const aleoAccount = newSimpleWallet.accountsMap[CoinType.ALEO][0];
    if (aleoAccount) {
      const otherAccounts = await this.#aleoStorage.getAccountsAddress();
      for (const otherAccount of otherAccounts) {
        const info = await this.#aleoStorage.getAccountInfo(otherAccount);
        if (info) {
          await this.#aleoStorage.setAccountInfo({
            ...info,
            priority: TaskPriority.LOW,
          });
        }
      }
      const item: AleoSyncAccount = {
        walletId: newSimpleWallet.walletId,
        accountId: aleoAccount.accountId,
        address: aleoAccount.address,
        viewKey: aleoAccount.viewKey,
        priority: TaskPriority.MEDIUM,
      };
      this.#aleoStorage.setAccountInfo(item);
    }
  }

  async setSimpleWallet(simpleWallet: SimpleWallet) {
    const keyring = (await this.getKeyring()) || {};
    const simpleWallets = keyring[WalletType.SIMPLE] || [];
    const oldWalletIndex = simpleWallets.findIndex(
      (item) => item.walletId === simpleWallet.walletId,
    );
    if (oldWalletIndex > -1) {
      const oldWallet = simpleWallets[oldWalletIndex];
      simpleWallets[oldWalletIndex] = {
        ...oldWallet,
        ...simpleWallet,
      };
    }
    await this.setKeyring({
      ...keyring,
      [WalletType.SIMPLE]: [...simpleWallets],
    });
  }

  async deleteWallet(walletId: string): Promise<void> {
    const keyring = (await this.getKeyring()) || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const simpleWallets = keyring[WalletType.SIMPLE] || [];
    const newHDWallets = [...hdWallets];
    const newSimpleWallets = [...simpleWallets];
    const index = newHDWallets.findIndex((w) => w.walletId === walletId);
    if (index > -1) {
      const wallet = newHDWallets[index];
      const aleoAccount = wallet.accountsMap[CoinType.ALEO];
      for (let account of aleoAccount) {
        await this.#aleoStorage.removeAccount(account.address);
      }
      newHDWallets.splice(index, 1);
    } else {
      const index = newSimpleWallets.findIndex((w) => w.walletId === walletId);
      if (index > -1) {
        const wallet = newSimpleWallets[index];
        const aleoAccount = wallet.accountsMap[CoinType.ALEO];
        for (let account of aleoAccount) {
          await this.#aleoStorage.removeAccount(account.address);
        }
        newSimpleWallets.splice(index, 1);
      }
    }

    return await this.setKeyring({
      ...keyring,
      [WalletType.SIMPLE]: newSimpleWallets,
      [WalletType.HD]: newHDWallets,
    });
  }

  async getVault() {
    return (await this.#storage.get(null)) as Vault;
  }

  async setVault(vault: Vault) {
    return await this.#storage.set(vault);
  }
}

export const vaultStorage = new VaultStorage();
