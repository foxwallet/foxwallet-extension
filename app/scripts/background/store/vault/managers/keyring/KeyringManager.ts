import { HDKeyring } from "core/wallet/HDKeyring";
import {
  CoinType,
  EncryptedField,
  EncryptedKeyPairWithViewKey,
} from "core/types";
import { VaultStorage, vaultStorage } from "../../VaultStorage";
import {
  AccountMethod,
  AccountWithViewKey,
  BaseWallet,
  DisplayAccount,
  DisplayKeyring,
  DisplayWallet,
  HDWallet,
  KeyringObj,
  WalletType,
} from "../../types/keyring";
import { nanoid } from "nanoid";
import { AuthManager } from "../auth/AuthManager";
import { decryptStr } from "core/utils/encrypt";
import { logger } from "../../../../../../common/utils/logger";
import { AddAccountProps } from "../../../../servers/IWalletServer";
import initAleoWasm from "aleo_wasm";

export class KeyringManager {
  #storage: VaultStorage;
  #authManager: AuthManager;
  #hdKeyrings: { [walletId in string]?: HDKeyring };

  constructor(authManager: AuthManager) {
    this.#storage = vaultStorage;
    this.#authManager = authManager;
    this.#hdKeyrings = {};
  }

  async init() {
    await initAleoWasm();
  }

  async reset() {
    this.#hdKeyrings = {};
  }

  #getToken() {
    const token = this.#authManager.getToken();
    if (!token) {
      throw new Error("Login before access keyring");
    }
    return token;
  }

  #formatDisplayAccountsMap(accountsMap: {
    [coinType in CoinType]: AccountWithViewKey[];
  }): { [coinType in CoinType]: DisplayAccount[] } {
    let map: { [coinType in CoinType]: DisplayAccount[] } = {
      [CoinType.ALEO]: [],
    };
    for (let coinType of Object.values(CoinType)) {
      map[coinType] = accountsMap[coinType].map((item) => {
        const { privateKey, viewKey, ...rest } = item;
        return rest;
      });
    }
    return map;
  }

  #formatDisplayWallet(wallet: BaseWallet): DisplayWallet {
    return {
      walletType: wallet.walletType,
      walletId: wallet.walletId,
      walletName: wallet.walletName,
      accountsMap: this.#formatDisplayAccountsMap(wallet.accountsMap),
    };
  }

  async getWallet(walletId: string): Promise<DisplayWallet> {
    return this.#formatDisplayWallet(await this.#storage.getHDWallet(walletId));
  }

  async getAllWallet(): Promise<DisplayKeyring> {
    this.#getToken();
    const keyrings = (await this.#storage.getKeyring()) || {};
    const hdWallets = (keyrings[WalletType.HD] || []).map((item) =>
      this.#formatDisplayWallet(item),
    );
    const simpleWallets = (keyrings[WalletType.SIMPLE] || []).map((item) =>
      this.#formatDisplayWallet(item),
    );
    return {
      [WalletType.HD]: hdWallets,
      [WalletType.SIMPLE]: simpleWallets,
    };
  }

  async createNewWallet({
    walletName,
    walletId,
    revealMnemonic,
  }: {
    walletName: string;
    walletId: string;
    revealMnemonic: boolean;
  }): Promise<DisplayWallet> {
    const token = this.#getToken();
    const existWallet = await this.#storage.isHDWalletExist(walletId);
    if (existWallet) {
      throw new Error("Wallet have existed");
    }
    const newKeyring = await HDKeyring.init({
      token,
      walletId,
    });
    const newMnemonic = newKeyring.getEncryptedMnemonic() as
      | EncryptedField
      | undefined;
    if (!newMnemonic) {
      throw new Error("createNewWallet failed");
    }
    const newAccount = (await newKeyring.derive(
      nanoid(),
      0,
      CoinType.ALEO,
      token,
    )) as EncryptedKeyPairWithViewKey;
    const accountName = "Account 1";
    const newWallet: HDWallet = {
      walletType: WalletType.HD,
      walletId,
      walletName,
      origin: "create",
      mnemonic: newMnemonic,
      accountsMap: {
        [CoinType.ALEO]: [
          {
            ...newAccount,
            accountName,
          },
        ],
      },
    };

    await this.#storage.addHDWallet(newWallet, AccountMethod.CREATE);
    this.#hdKeyrings[walletId] = newKeyring;
    const wallet = await this.getWallet(walletId);

    if (revealMnemonic) {
      wallet.mnemonic = await decryptStr(token, newMnemonic);
    }

    return wallet;
  }

  async regenerateWallet({
    walletId,
    walletName,
    revealMnemonic,
  }: {
    walletId: string;
    walletName: string;
    revealMnemonic: boolean;
  }): Promise<DisplayWallet> {
    const token = this.#getToken();
    const keyring = await HDKeyring.init({
      token,
      walletId,
    });
    if (!keyring) {
      throw new Error("regenerateWallet failed");
    }
    const newMnemonic = keyring.getEncryptedMnemonic() as
      | EncryptedField
      | undefined;
    if (!newMnemonic) {
      throw new Error("regenerateWallet failed");
    }
    const newAccount = (await keyring.derive(
      nanoid(),
      0,
      CoinType.ALEO,
      token,
    )) as EncryptedKeyPairWithViewKey;

    const accountName = "Account 1";
    const newWallet: HDWallet = {
      walletType: WalletType.HD,
      walletId,
      walletName,
      origin: "create",
      mnemonic: newMnemonic,
      accountsMap: {
        [CoinType.ALEO]: [
          {
            ...newAccount,
            accountName,
          },
        ],
      },
    };

    await this.#storage.setHDWallet(newWallet, AccountMethod.REGENERATE);

    this.#hdKeyrings[walletId] = keyring;

    const wallet = await this.getWallet(walletId);

    if (revealMnemonic) {
      wallet.mnemonic = await decryptStr(token, newMnemonic);
    }

    return wallet;
  }

  async importHDWallet({
    walletName,
    walletId,
    mnemonic,
  }: {
    walletName: string;
    walletId: string;
    mnemonic: string;
  }): Promise<DisplayWallet> {
    const token = this.#getToken();
    const existWallet = await this.#storage.isHDWalletExist(walletId);
    if (existWallet) {
      throw new Error("Wallet have existed");
    }
    const keyrings = Object.values(this.#hdKeyrings);
    for (let keyring of keyrings) {
      const encryptedMnemonic = keyring?.getEncryptedMnemonic();
      if (!encryptedMnemonic) {
        continue;
      }
      const exist = await decryptStr(token, encryptedMnemonic);
      if (exist === mnemonic) {
        throw new Error("Mnemonic exist!");
      }
    }
    const newKeyring = await HDKeyring.import({
      token,
      walletId,
      mnemonic,
    });
    const newMnemonic = newKeyring.getEncryptedMnemonic() as
      | EncryptedField
      | undefined;
    if (!newMnemonic) {
      throw new Error("createNewWallet failed");
    }
    const newAccount = (await newKeyring.derive(
      nanoid(),
      0,
      CoinType.ALEO,
      token,
    )) as EncryptedKeyPairWithViewKey;

    const accountName = "Account 1";
    const newWallet: HDWallet = {
      walletType: WalletType.HD,
      walletId,
      walletName,
      origin: "import",
      mnemonic: newMnemonic,
      accountsMap: {
        [CoinType.ALEO]: [
          {
            ...newAccount,
            accountName,
          },
        ],
      },
    };
    await this.#storage.addHDWallet(newWallet, AccountMethod.IMPORT);

    this.#hdKeyrings[walletId] = newKeyring;

    return await this.getWallet(walletId);
  }

  async addNewAccount({
    walletId,
    coin,
    accountId,
  }: AddAccountProps): Promise<DisplayWallet> {
    const token = this.#getToken();
    const hdWallet = await this.#storage.getHDWallet(walletId);
    const index = hdWallet.accountsMap[coin].length;
    let keyring = this.#hdKeyrings[walletId];
    if (!keyring) {
      keyring = await HDKeyring.restore({
        walletId,
        token,
        mnemonic: hdWallet.mnemonic,
      });
      this.#hdKeyrings[walletId] = keyring;
      logger.log("===> addNewAccount wallet: ", keyring);
    }
    const existAccount = hdWallet.accountsMap[coin].some(
      (item) => item.accountId === accountId,
    );
    if (existAccount) {
      throw new Error("Account have existed");
    }
    const newEncryptedKeyPair = (await keyring.derive(
      accountId,
      index,
      coin,
      token,
    )) as EncryptedKeyPairWithViewKey;
    // TODO: use i18n
    const accountName = `Account ${index}`;
    const newHdWallet: HDWallet = {
      ...hdWallet,
      accountsMap: {
        ...hdWallet.accountsMap,
        [coin]: [
          ...hdWallet.accountsMap[coin],
          {
            ...newEncryptedKeyPair,
            accountName,
          },
        ],
      },
    };
    await this.#storage.setHDWallet(newHdWallet, AccountMethod.ADD);

    return await this.getWallet(walletId);
  }
}
