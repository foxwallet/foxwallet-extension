import { walletStorageInstance } from "../../../../common/utils/storage";
import { Cipher, HDWallet, KeyringObj, Vault, WalletType } from "./types/keyring";

const VAULT_KEY = "vault";

export class VaultStorage {
  #storage: LocalForage;

  constructor() {
    this.#storage = walletStorageInstance;
  }

  async getCipher() {
    const store = await this.#storage.getItem<Vault>(VAULT_KEY);
    return store?.cipher;
  }

  // only called when initPassword
  async initCipher(cipher: Cipher) {
    const store: Vault = {
      cipher,
    };
    return await this.#storage.setItem(VAULT_KEY, store);
  }

  async getKeyring() {
    const store = await this.#storage.getItem<Vault>(VAULT_KEY);
    return store?.keyring;
  }

  async setKeyring(keyring: KeyringObj) {
    const vault = await this.getVault();
    const store: Vault = {
      ...vault,
      keyring,
    };
    return await this.#storage.setItem(VAULT_KEY, store);
  }

  async getHDWallet(walletId: string) {
    const keyring = await this.getKeyring() || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const hdWallet = hdWallets.find((item) => item.walletId === walletId);
    if (!hdWallet) {
      throw new Error("HDWallet not exists " + walletId);
    }
    return hdWallet;
  }

  async isHDWalletExist(walletId: string) {
    const keyring = await this.getKeyring() || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const hdWallet = hdWallets.find((item) => item.walletId === walletId);
    return !!hdWallet;
  }

  async addHDWallet(newHdWallet: HDWallet) {
    const keyring = await this.getKeyring() || {};
    const hdWallets = keyring[WalletType.HD] || [];
    if (hdWallets.some((item) => item.walletId === newHdWallet.walletId)) {
      throw new Error("HDWallet already exists");
    }
    const newHdWallets = [...hdWallets, newHdWallet];
    await this.setKeyring({
      ...keyring,
      [WalletType.HD]: newHdWallets,
    });
  }

  async setHDWallet(hdWallet: HDWallet) {
    const keyring = await this.getKeyring() || {};
    const hdWallets = keyring[WalletType.HD] || [];
    const newHdWallets = hdWallets.map((item) => {
      if (item.walletId === hdWallet.walletId) {
        return hdWallet;
      }
      return item;
    });
    await this.setKeyring({
      ...keyring,
      [WalletType.HD]: newHdWallets,
    });
  }

  async getVault() {
    return await this.#storage.getItem<Vault>(VAULT_KEY);
  }

  async setVault(vault: Vault) {
    return await this.#storage.setItem(VAULT_KEY, vault);
  }
}

export const vaultStorage = new VaultStorage();
