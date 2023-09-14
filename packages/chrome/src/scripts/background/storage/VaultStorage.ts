import { Cipher, KeyringObj, Vault } from "../../../common/types/keyring";
import { bgStorageInstance } from "./storage";

const VAULT_KEY = "vault";

export class VaultStorage {
  #storage: LocalForage;

  constructor() {
    this.#storage = bgStorageInstance;
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

  async getVault() {
    return await this.#storage.getItem<Vault>(VAULT_KEY);
  }

  async setVault(vault: Vault) {
    return await this.#storage.setItem(VAULT_KEY, vault);
  }
}

export const vaultStorage = new VaultStorage();
