import { CoinType, CoinTypeV1 } from "core/types";
import { walletStorageInstance } from "@/common/utils/localstorage";
import {
  AccountMethod,
  AccountWithViewKey,
  Cipher,
  ComposedAccount, GroupAccount,
  HDWallet,
  KeyringObj,
  OneMatchGroupAccount,
  SimpleWallet,
  Vault,
  VaultKeys,
  WalletType,
} from "./types/keyring";
import browser from "webextension-polyfill";
import { TaskPriority } from "core/coins/ALEO/types/SyncTask";
import { AleoStorage } from "../aleo/AleoStorage";
import { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";
import { vaultVersion } from "./types/version";
import { VaultV1 } from "./types/keyringV1";
import { Mutex } from "async-mutex";
import { nanoid } from "nanoid";
import {
  accountSettingStorage,
} from "../account/AccountStorage";
import { AccountSettingStorageV1 } from "../account/AccountStorageV1";
import { DEFAULT_ALEO_ACCOUNT_OPTION } from "core/coins/ALEO/config/derivation";
import { keyringManager } from "@/scripts/background";

const mutex = new Mutex();
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
      keyring: {
        version: vaultVersion,
      },
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

  async getWallet(walletId: string) {
    const keyring = (await this.getKeyring()) || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const simpleWallets = keyring[WalletType.SIMPLE] || [];
    const wallet =
      hdWallets.find((item) => item.walletId === walletId) ||
      simpleWallets.find((item) => item.walletId === walletId);
    if (!wallet) {
      throw new Error("wallet not exists " + walletId);
    }
    return wallet;
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
        const groupAccount = newHdWallet.groupAccounts[0];
        const aleoAccount = groupAccount?.accounts.find(
          (account) => account.coinType === CoinType.ALEO,
        );
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
            viewKey: (aleoAccount as AccountWithViewKey).viewKey,
            priority: TaskPriority.MEDIUM,
          };
          void this.#aleoStorage.setAccountInfo(item);
        }
        break;
      }
      case AccountMethod.IMPORT: {
        const groupAccount = newHdWallet.groupAccounts[0];
        const aleoAccount = groupAccount?.accounts.find(
          (account) => account.coinType === CoinType.ALEO,
        );
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
            viewKey: (aleoAccount as AccountWithViewKey).viewKey,
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
          const oldGroupAccount = oldWallet.groupAccounts[0];
          const oldAleoAccount = oldGroupAccount?.accounts.find(
            (account) => account.coinType === CoinType.ALEO,
          );
          if (oldAleoAccount) {
            await this.#aleoStorage.removeAccount(oldAleoAccount.address);
          }
          const groupAccount = hdWallet.groupAccounts[0];
          const aleoAccount = groupAccount?.accounts.find(
            (account) => account.coinType === CoinType.ALEO,
          );
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
              viewKey: (aleoAccount as AccountWithViewKey).viewKey,
              address: aleoAccount.address,
              priority: TaskPriority.MEDIUM,
            };
            this.#aleoStorage.setAccountInfo(item);
          }
          break;
        }
        case AccountMethod.ADD: {
          const groupAccount =
            hdWallet.groupAccounts[hdWallet.groupAccounts.length - 1];
          const aleoAccount = groupAccount?.accounts.find(
            (account) => account.coinType === CoinType.ALEO,
          );
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
              viewKey: (aleoAccount as AccountWithViewKey).viewKey,
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
    const aleoAccount = newSimpleWallet.groupAccounts[0]?.accounts.find(
      (account) => account.coinType === CoinType.ALEO,
    );
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
        viewKey: (aleoAccount as AccountWithViewKey).viewKey,
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

  async resetWallet(): Promise<void> {
    return await this.setKeyring({});
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
      const groupAccounts = wallet.groupAccounts;
      const aleoAccounts = groupAccounts.reduce((accounts, groupAccount) => {
        return accounts.concat(
          groupAccount.accounts.filter(
            (account) => account.coinType === CoinType.ALEO,
          ),
        );
      }, [] as ComposedAccount[]);
      try {
        for (let account of aleoAccounts) {
          await this.#aleoStorage.removeAccount(account.address);
        }
      } catch (e) {
        console.log("aleoStorage#deleteHDWallet error ", e);
      } finally {
        newHDWallets.splice(index, 1);
      }
    } else {
      const index = newSimpleWallets.findIndex((w) => w.walletId === walletId);
      if (index > -1) {
        const wallet = newSimpleWallets[index];
        const groupAccounts = wallet.groupAccounts;
        const aleoAccounts = groupAccounts.reduce((accounts, groupAccount) => {
          return accounts.concat(
            groupAccount.accounts.filter(
              (account) => account.coinType === CoinType.ALEO,
            ),
          );
        }, [] as ComposedAccount[]);
        try {
          for (let account of aleoAccounts) {
            await this.#aleoStorage.removeAccount(account.address);
          }
        } catch (e) {
          console.log("aleoStorage#deleteSimpleWallet error ", e);
        } finally {
          newSimpleWallets.splice(index, 1);
        }
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

  async migrate() {
    const release = await mutex.acquire();
    try {
      const vault = await this.getVault();
      console.log("migrate", vault);
      console.log("migrate", JSON.stringify(vault, null, 2));
      if (
        vault[VaultKeys.keyring] &&
        vault[VaultKeys.keyring].version !== vaultVersion
      ) {
        const currentVersion = vault[VaultKeys.keyring].version;
        let oldSelectedAccountInfo: {
          walletId: string;
          groupId?: string;
          index: number;
        } | undefined = undefined;
        switch (currentVersion) {
          case 3: {
            break;
          }
          case 2: {
            await keyringManager.completeAccountsForHdWallet();
            const oldSelectedAccount =
              await accountSettingStorage.getSelectedGroupAccount();
            if (oldSelectedAccount) {
              oldSelectedAccountInfo = {
                walletId: oldSelectedAccount.wallet.walletId,
                groupId: oldSelectedAccount.group.groupId,
                index: oldSelectedAccount.group.index,
              };
            }
            break;
          }
          case 1:
          case undefined: {
            const vaultV1 = vault as VaultV1;
            const keyringV1 = vaultV1[VaultKeys.keyring] ?? {};
            const hdWalletsV1 = keyringV1[WalletType.HD] || [];
            const hdWallets: HDWallet[] = [];
            hdWalletsV1.map((hdWalletV1) => {
              const { accountsMap, ...restWallet } = hdWalletV1;
              const groupAccounts: Array<ComposedAccount[]> = [];
              Object.keys(accountsMap).forEach((coinType) => {
                const accounts = accountsMap[coinType as CoinTypeV1];
                accounts.forEach((account) => {
                  const index = account.index;
                  if (!groupAccounts[index]) {
                    groupAccounts[index] = [];
                  }
                  const newAccount: AccountWithViewKey = {
                    ...account,
                    //  v1 only have ALEO account
                    coinType: CoinType.ALEO,
                    option: DEFAULT_ALEO_ACCOUNT_OPTION,
                  };
                  groupAccounts[index].push(newAccount);
                });
              });
              const newHdWallet: HDWallet = {
                ...restWallet,
                groupAccounts: groupAccounts.map((accounts, index) => {
                  const groupName = `Account ${index + 1}`;
                  return {
                    groupId: nanoid(),
                    groupName,
                    index,
                    accounts,
                  };
                }),
              };
              hdWallets.push(newHdWallet);
            });

            const simpleWalletsV1 = keyringV1[WalletType.SIMPLE] || [];
            const simpleWallets: SimpleWallet[] = [];
            simpleWalletsV1.map((simpleWalletV1) => {
              const { accountsMap, ...restWallet } = simpleWalletV1;
              const groupAccounts: Array<AccountWithViewKey[]> = [];
              Object.keys(accountsMap).forEach((coinType) => {
                const accounts = accountsMap[coinType as CoinTypeV1];
                accounts.forEach((account) => {
                  const index = account.index;
                  if (!groupAccounts[index]) {
                    groupAccounts[index] = [];
                  }
                  const newAccount: AccountWithViewKey = {
                    ...account,
                    coinType: CoinType.ALEO,
                    option: DEFAULT_ALEO_ACCOUNT_OPTION,
                  };
                  groupAccounts[index].push(newAccount);
                });
              });
              const newSimpleWallet: SimpleWallet = {
                ...restWallet,
                groupAccounts: groupAccounts.map((accounts, index) => {
                  const groupName = `Account ${index + 1}`;
                  return {
                    groupId: nanoid(),
                    groupName,
                    index,
                    accounts,
                  };
                }),
              };
              simpleWallets.push(newSimpleWallet);
            });

            const newVault: Vault = {
              [VaultKeys.cipher]: vaultV1[VaultKeys.cipher],
              [VaultKeys.keyring]: {
                [WalletType.HD]: hdWallets,
                [WalletType.SIMPLE]: simpleWallets,
                version: vaultVersion,
              },
            };
            await this.setVault(newVault);

            const oldSelectedAccount =
              await AccountSettingStorageV1.getInstance().getSelectedAccount(
                CoinType.ALEO,
              );
            // 2->3 ?
            await keyringManager.completeAccountsForHdWallet();


            if (oldSelectedAccount) {
              oldSelectedAccountInfo = {
                walletId: oldSelectedAccount.walletId,
                index: oldSelectedAccount.index,
              };
            }
            break;
          }
        }
        if (oldSelectedAccountInfo) {
          let selectedGroupAccount: OneMatchGroupAccount | null = null;
          const vaultV2 = await this.getVault();
          const keyringV2 = vaultV2[VaultKeys.keyring] ?? {};
          const hdWalletsV2 = keyringV2[WalletType.HD] || [];
          const simpleWalletsV2 = keyringV2[WalletType.SIMPLE] || [];

          for (let hdWallet of hdWalletsV2) {
            if (hdWallet.walletId === oldSelectedAccountInfo.walletId) {
              const { groupAccounts, ...restWallet } = hdWallet;
              for (let groupAccount of groupAccounts) {
                const { index, groupId } = groupAccount;
                if (index === oldSelectedAccountInfo.index) {
                  if (oldSelectedAccountInfo.groupId && oldSelectedAccountInfo.groupId !== groupId) {
                    console.error("groupId not matching index");
                  }
                  selectedGroupAccount = {
                    wallet: restWallet,
                    group: groupAccount,
                  };
                }
                if (selectedGroupAccount) {
                  break;
                }
              }
              break;
            }
          }

          for (let simpleWallet of simpleWalletsV2) {
            if (simpleWallet.walletId === oldSelectedAccountInfo.walletId) {
              const { groupAccounts, ...restWallet } = simpleWallet;
              for (let groupAccount of groupAccounts) {
                const { index, groupId } = groupAccount;
                if (index === oldSelectedAccountInfo.index) {
                  if (oldSelectedAccountInfo.groupId && oldSelectedAccountInfo.groupId !== groupId) {
                    console.error("groupId not matching index");
                  }
                  selectedGroupAccount = {
                    wallet: restWallet,
                    group: groupAccount,
                  };
                  break;
                }
                if (selectedGroupAccount) {
                  break;
                }
              }
              break;
            }
          }

          if (!selectedGroupAccount && hdWalletsV2[0]) {
            const { groupAccounts, ...restWallet } = hdWalletsV2[0];
            if (groupAccounts[0]) {
              selectedGroupAccount = {
                wallet: restWallet,
                group: groupAccounts[0],
              };
            }
          }

          if (!selectedGroupAccount && simpleWalletsV2[0]) {
            const { groupAccounts, ...restWallet } = simpleWalletsV2[0];
            if (groupAccounts[0]) {
              selectedGroupAccount = {
                wallet: restWallet,
                group: groupAccounts[0],
              };
            }
          }


          console.log("migrate", selectedGroupAccount);
          if (selectedGroupAccount) {
            await accountSettingStorage.setSelectedGroupAccount(
              selectedGroupAccount,
            );
          } else {
            throw new Error(
              "Vault migrate error, selected account is null " +
              JSON.stringify(hdWalletsV2) +
              JSON.stringify(simpleWalletsV2),
            );
          }
        }
      }
    } finally {
      release();
    }
  }
}

export const vaultStorage = new VaultStorage();
