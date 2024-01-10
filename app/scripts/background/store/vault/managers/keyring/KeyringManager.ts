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
  SimpleWallet,
  WalletType,
} from "../../types/keyring";
import { nanoid } from "nanoid";
import { AuthManager } from "../auth/AuthManager";
import { decryptStr, encryptStr } from "core/utils/encrypt";
import { logger } from "../../../../../../common/utils/logger";
import {
  AddAccountProps,
  ChangeAccountStateProps,
  ImportPrivateKeyProps,
} from "../../../../servers/IWalletServer";
import initAleoWasm from "aleo_wasm";
import { ERROR_CODE } from "@/common/types/error";
import { coinBasicFactory } from "core/coins/CoinBasicFactory";

export class KeyringManager {
  #storage: VaultStorage;
  #authManager: AuthManager;
  // #hdKeyrings: { [walletId in string]?: HDKeyring };

  constructor(authManager: AuthManager) {
    this.#storage = vaultStorage;
    this.#authManager = authManager;
    // this.#hdKeyrings = {};
  }

  async init() {
    await initAleoWasm();
  }

  // TODO: reset
  async reset() {}

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

  async getHDWallet(walletId: string): Promise<DisplayWallet> {
    return this.#formatDisplayWallet(await this.#storage.getHDWallet(walletId));
  }

  async getSimpleWallet(walletId: string): Promise<DisplayWallet> {
    return this.#formatDisplayWallet(
      await this.#storage.getSimpleWallet(walletId),
    );
  }

  async getAllWallet(noAuth?: boolean): Promise<DisplayKeyring> {
    if (!noAuth) {
      this.#getToken();
    }
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
            hide: false,
          },
        ],
      },
    };

    await this.#storage.addHDWallet(newWallet, AccountMethod.CREATE);
    // this.#hdKeyrings[walletId] = newKeyring;
    const wallet = await this.getHDWallet(walletId);

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
            hide: false,
          },
        ],
      },
    };

    await this.#storage.setHDWallet(newWallet, AccountMethod.REGENERATE);

    // this.#hdKeyrings[walletId] = keyring;

    const wallet = await this.getHDWallet(walletId);

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
    const allHDWallets = await this.#storage.getAllHDWallets();
    for (let hdWallet of allHDWallets) {
      const encryptedMnemonic = hdWallet.mnemonic;
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
            hide: false,
          },
        ],
      },
    };
    await this.#storage.addHDWallet(newWallet, AccountMethod.IMPORT);

    return await this.getHDWallet(walletId);
  }

  async addNewAccount({
    walletId,
    coinType,
    accountId,
  }: AddAccountProps): Promise<DisplayWallet> {
    const token = this.#getToken();
    const hdWallet = await this.#storage.getHDWallet(walletId);
    const index = hdWallet.accountsMap[coinType].length;
    const existAccount = hdWallet.accountsMap[coinType].some(
      (item) => item.accountId === accountId,
    );
    if (existAccount) {
      throw new Error("AccountId have existed");
    }
    const keyring = await HDKeyring.restore({
      walletId,
      token,
      mnemonic: hdWallet.mnemonic,
    });
    const newEncryptedKeyPair = (await keyring.derive(
      accountId,
      index,
      coinType,
      token,
    )) as EncryptedKeyPairWithViewKey;
    // TODO: use i18n
    const accountName = `Account ${index + 1}`;
    const newHdWallet: HDWallet = {
      ...hdWallet,
      accountsMap: {
        ...hdWallet.accountsMap,
        [coinType]: [
          ...hdWallet.accountsMap[coinType],
          {
            ...newEncryptedKeyPair,
            accountName,
            hide: false,
          },
        ],
      },
    };
    await this.#storage.setHDWallet(newHdWallet, AccountMethod.ADD);

    return await this.getHDWallet(walletId);
  }

  async importPrivateKey<T extends CoinType>({
    walletId,
    walletName,
    coinType,
    privateKey,
    privateKeyType,
  }: ImportPrivateKeyProps<T>) {
    const token = this.#getToken();
    const simpleWallets = await this.#storage.getAllSimpleWallets();
    for (const wallet of simpleWallets) {
      const account = wallet.accountsMap[coinType]?.[0];
      if (!account) {
        continue;
      }
      const existPrivateKey = await decryptStr(token, account.privateKey);
      if (existPrivateKey === privateKey) {
        throw new Error("PrivateKey exist!");
      }
    }
    const account = await coinBasicFactory(coinType).deriveAccount(
      privateKey,
      privateKeyType,
    );
    const privateKeyObj = await encryptStr(token, privateKey);
    if (!privateKeyObj) {
      throw new Error("Encrypt privateKey failed");
    }
    const newSimpleWallet: SimpleWallet = {
      walletType: WalletType.SIMPLE,
      walletId,
      walletName,
      accountsMap: {
        [CoinType.ALEO]: [
          {
            ...account,
            index: 0,
            accountId: nanoid(),
            accountName: "Account 1",
            privateKey: privateKeyObj,
            hide: false,
          },
        ],
      },
    };
    await this.#storage.addSimpleWallet(newSimpleWallet);

    return await this.getSimpleWallet(walletId);
  }

  async getPrivateKey({
    walletId,
    coinType,
    accountId,
  }: {
    walletId: string;
    coinType: CoinType;
    accountId: string;
  }) {
    const token = this.#getToken();
    if (!token) {
      throw new Error(ERROR_CODE.NOT_AUTH);
    }
    const wallet = await this.#storage.getWallet(walletId);
    const account = wallet.accountsMap[coinType].find(
      (item) => item.accountId === accountId,
    );
    if (!account) {
      throw new Error("Account not found " + accountId);
    }
    const encryptedPrivateKey = account.privateKey;
    const privateKey = decryptStr(token, encryptedPrivateKey);
    return privateKey;
  }

  async getPrivateKeyByAddress({
    coinType,
    address,
  }: {
    coinType: CoinType;
    address: string;
  }) {
    const token = this.#getToken();
    if (!token) {
      throw new Error(ERROR_CODE.NOT_AUTH);
    }
    const keyring = await this.#storage.getKeyring();
    if (!keyring) {
      throw new Error("Empty keyring");
    }
    const { HD: hdWallets, SIMPLE: simpleWallets } = keyring;
    if (hdWallets) {
      for (const wallet of hdWallets) {
        const account = wallet.accountsMap[coinType].find(
          (item) => item.address === address,
        );
        if (!account) {
          continue;
        }
        const encryptedPrivateKey = account.privateKey;
        const privateKey = decryptStr(token, encryptedPrivateKey);
        return privateKey;
      }
    }
    if (simpleWallets) {
      for (const wallet of simpleWallets) {
        const account = wallet.accountsMap[coinType].find(
          (item) => item.address === address,
        );
        if (!account) {
          continue;
        }
        const encryptedPrivateKey = account.privateKey;
        const privateKey = decryptStr(token, encryptedPrivateKey);
        return privateKey;
      }
    }
    throw new Error("Account not found " + address);
  }

  async getViewKey({
    coinType,
    address,
  }: {
    coinType: CoinType;
    address: string;
  }) {
    const token = this.#getToken();
    if (!token) {
      throw new Error(ERROR_CODE.NOT_AUTH);
    }
    const keyring = await this.#storage.getKeyring();
    if (!keyring) {
      throw new Error("Empty keyring");
    }
    const { HD: hdWallets, SIMPLE: simpleWallets } = keyring;
    if (hdWallets) {
      for (const wallet of hdWallets) {
        const account = wallet.accountsMap[coinType].find(
          (item) => item.address === address,
        );
        if (!account) {
          continue;
        }
        return account.viewKey;
      }
    }
    if (simpleWallets) {
      for (const wallet of simpleWallets) {
        const account = wallet.accountsMap[coinType].find(
          (item) => item.address === address,
        );
        if (!account) {
          continue;
        }
        return account.viewKey;
      }
    }
    throw new Error("Account not found " + address);
  }

  async hasWallet() {
    const keyring = await this.#storage.getKeyring();
    if (
      !keyring ||
      !keyring[WalletType.HD] ||
      keyring[WalletType.HD]?.length === 0
    ) {
      return false;
    }
    return true;
  }

  async getHDMnemonic(walletId: string): Promise<string> {
    const token = this.#getToken();
    if (!token) {
      throw new Error(ERROR_CODE.NOT_AUTH);
    }
    const keyring = await this.#storage.getKeyring();
    if (!keyring) {
      throw new Error("Empty keyring");
    }
    const { HD: hdWallets } = keyring;
    if (hdWallets) {
      const match = hdWallets.find((w) => w.walletId === walletId);
      if (!match) {
        throw new Error("Wallet not found");
      }
      return await decryptStr(token, match.mnemonic);
    }
    return "";
  }

  async deleteWallet(walletId: string): Promise<void> {
    const token = this.#getToken();
    if (!token) {
      throw new Error(ERROR_CODE.NOT_AUTH);
    }
    const keyring = await this.#storage.getKeyring();
    if (!keyring) {
      throw new Error("Empty keyring");
    }
    return await this.#storage.deleteWallet(walletId);
  }

  async changeAccountHideState(params: ChangeAccountStateProps) {
    const token = this.#getToken();
    if (!token) {
      throw new Error(ERROR_CODE.NOT_AUTH);
    }
    const keyring = await this.#storage.getKeyring();
    if (!keyring) {
      throw new Error("Empty keyring");
    }
    return await this.#storage.changeAccountHideState(params);
  }
}
