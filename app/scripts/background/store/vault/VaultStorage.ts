import { CoinType } from "core/types";
import { walletStorageInstance } from "../../../../common/utils/localstorage";
import {
  AccountMethod,
  Cipher,
  HDWallet,
  KeyringObj,
  Vault,
  VaultKeys,
  WalletType,
} from "./types/keyring";
import browser from "webextension-polyfill";
import { ReserveChainConfigs } from "core/env";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AutoSwitch } from "@/common/utils/retry";
import { AutoSwitchServiceType } from "@/common/types/retry";
import { logger } from "@/common/utils/logger";
import { TaskPriority } from "core/coins/ALEO/types/SyncTask";
import { AleoStorage } from "../aleo/AleoStorage";
import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { AleoSyncAccount } from "core/coins/ALEO/types/AleoSyncAccount";
import { AleoRpcService } from "core/coins/ALEO/service/instances/rpc";

export class VaultStorage {
  #storage: browser.Storage.LocalStorageArea;
  #aleoStorage: AleoStorage;
  rpcService: AleoRpcService;

  constructor() {
    this.#storage = walletStorageInstance;
    this.#aleoStorage = AleoStorage.getInstance();
    this.rpcService = new AleoRpcService({
      configs: ReserveChainConfigs[InnerChainUniqueId.ALEO_TESTNET_3].rpcList,
    });
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

  async getAllHDWallets() {
    const keyring = (await this.getKeyring()) || {};
    return keyring[WalletType.HD] || [];
  }

  async isHDWalletExist(walletId: string) {
    const keyring = (await this.getKeyring()) || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const hdWallet = hdWallets.find((item) => item.walletId === walletId);
    return !!hdWallet;
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async getLatestHeight() {
    return await this.rpcService.currInstance().getLatestHeight();
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
          const chainId = ALEO_CHAIN_CONFIGS.TEST_NET_3.chainId;
          const otherAccounts =
            await this.#aleoStorage.getAccountsAddress(chainId);
          for (const otherAccount of otherAccounts) {
            const info = await this.#aleoStorage.getAccountInfo(
              chainId,
              otherAccount,
            );
            if (info) {
              await this.#aleoStorage.setAccountInfo(chainId, {
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
          this.getLatestHeight()
            .then((height) => {
              item.height = height;
              this.#aleoStorage.setAccountInfo(chainId, item);
            })
            .catch((err) => {
              logger.error("===> VaultStorage getLatestHeight error: ", err);
              this.#aleoStorage.setAccountInfo(chainId, item);
            });
        }
        break;
      }
      case AccountMethod.IMPORT: {
        const aleoAccount = newHdWallet.accountsMap[CoinType.ALEO][0];
        if (aleoAccount) {
          // const otherAccounts = await this.#aleoStorage.keys();
          const chainId = ALEO_CHAIN_CONFIGS.TEST_NET_3.chainId;
          const otherAccounts =
            await this.#aleoStorage.getAccountsAddress(chainId);
          for (const otherAccount of otherAccounts) {
            const info = await this.#aleoStorage.getAccountInfo(
              chainId,
              otherAccount,
            );
            if (info) {
              await this.#aleoStorage.setAccountInfo(chainId, {
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
          this.#aleoStorage.setAccountInfo(chainId, item);
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
      const chainId = ALEO_CHAIN_CONFIGS.TEST_NET_3.chainId;
      switch (method) {
        case AccountMethod.REGENERATE: {
          const oldAccount = oldWallet.accountsMap[CoinType.ALEO][0];
          if (oldAccount) {
            await this.#aleoStorage.removeAccount(chainId, oldAccount.address);
          }
          const aleoAccount = hdWallet.accountsMap[CoinType.ALEO][0];
          if (aleoAccount) {
            const otherAccounts =
              await this.#aleoStorage.getAccountsAddress(chainId);
            for (const otherAccount of otherAccounts) {
              const info = await this.#aleoStorage.getAccountInfo(
                chainId,
                otherAccount,
              );
              if (info) {
                await this.#aleoStorage.setAccountInfo(chainId, {
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

            this.getLatestHeight()
              .then((height) => {
                item.height = height;
                this.#aleoStorage.setAccountInfo(chainId, item);
              })
              .catch((err) => {
                logger.error("===> VaultStorage getLatestHeight error: ", err);
                this.#aleoStorage.setAccountInfo(chainId, item);
              });
          }
          break;
        }
        case AccountMethod.ADD: {
          const length = hdWallet.accountsMap[CoinType.ALEO].length;
          const aleoAccount = hdWallet.accountsMap[CoinType.ALEO][length - 1];
          if (aleoAccount) {
            const otherAccounts =
              await this.#aleoStorage.getAccountsAddress(chainId);
            for (const otherAccount of otherAccounts) {
              const info = await this.#aleoStorage.getAccountInfo(
                chainId,
                otherAccount,
              );
              if (info) {
                await this.#aleoStorage.setAccountInfo(chainId, {
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
            this.#aleoStorage.setAccountInfo(chainId, item);
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
