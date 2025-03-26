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
  ComposedAccount,
  DisplayGroupAccount,
  DisplayKeyring,
  DisplayWallet,
  GroupAccount,
  HDWallet,
  SimpleWallet,
  Vault,
  VaultKeys,
  WalletType,
} from "../../types/keyring";
import { nanoid } from "nanoid";
import { AuthManager } from "../auth/AuthManager";
import { decryptStr, encryptStr } from "core/utils/encrypt";
import {
  AddAccountProps,
  ImportPrivateKeyProps,
} from "../../../../servers/IWalletServer";
import initAleoWasm from "aleo_wasm";
import { ERROR_CODE } from "@/common/types/error";
import { coinBasicFactory } from "core/coins/CoinBasicFactory";
import { vaultVersion } from "@/scripts/background/store/vault/types/version";

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

  #getToken() {
    const token = this.#authManager.getToken();
    if (!token) {
      throw new Error("Login before access keyring");
    }
    return token;
  }

  #formatDisplayGroupAccounts(
    groupAccounts: Array<GroupAccount>,
  ): Array<DisplayGroupAccount> {
    return groupAccounts.map((groupAccount) => {
      const { accounts, ...rest } = groupAccount;
      const displayAccounts = accounts.map((account) => {
        const { privateKey, viewKey, ...rest } = account as AccountWithViewKey;
        return rest;
      });
      return {
        ...rest,
        accounts: displayAccounts,
      };
    });
  }

  #formatDisplayWallet(wallet: BaseWallet): DisplayWallet {
    return {
      walletType: wallet.walletType,
      walletId: wallet.walletId,
      walletName: wallet.walletName,
      groupAccounts: this.#formatDisplayGroupAccounts(wallet.groupAccounts),
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
    console.log("keyrings", keyrings);
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
    const accounts: ComposedAccount[] = [];
    for (let coinType of Object.values(CoinType)) {
      const newAccount = (await newKeyring.derive(
        nanoid(),
        0,
        coinType,
        token,
      )) as EncryptedKeyPairWithViewKey;
      const accountName = "Account 1";
      accounts.push({
        ...newAccount,
        accountName,
      });
    }

    const newWallet: HDWallet = {
      walletType: WalletType.HD,
      walletId,
      walletName,
      origin: "create",
      mnemonic: newMnemonic,
      groupAccounts: [
        {
          groupId: nanoid(),
          groupName: "Account 1",
          index: 0,
          accounts,
        },
      ],
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

    const accounts: ComposedAccount[] = [];
    for (let coinType of Object.values(CoinType)) {
      const newAccount = (await keyring.derive(
        nanoid(),
        0,
        coinType,
        token,
      )) as EncryptedKeyPairWithViewKey;
      const accountName = "Account 1";
      accounts.push({
        ...newAccount,
        accountName,
      });
    }

    const newWallet: HDWallet = {
      walletType: WalletType.HD,
      walletId,
      walletName,
      origin: "create",
      mnemonic: newMnemonic,
      groupAccounts: [
        {
          groupId: nanoid(),
          groupName: "Account 1",
          index: 0,
          accounts,
        },
      ],
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
    const accounts: AccountWithViewKey[] = [];
    for (let coinType of Object.values(CoinType)) {
      const newAccount = (await newKeyring.derive(
        nanoid(),
        0,
        coinType,
        token,
      )) as EncryptedKeyPairWithViewKey;
      const accountName = "Account 1";
      accounts.push({
        ...newAccount,
        accountName,
      });
    }
    const newWallet: HDWallet = {
      walletType: WalletType.HD,
      walletId,
      walletName,
      origin: "import",
      mnemonic: newMnemonic,
      groupAccounts: [
        {
          groupId: nanoid(),
          groupName: "Account 1",
          index: 0,
          accounts,
        },
      ],
    };
    await this.#storage.addHDWallet(newWallet, AccountMethod.IMPORT);

    return await this.getHDWallet(walletId);
  }

  async addNewAccount({
    walletId,
    accountId,
  }: AddAccountProps): Promise<DisplayWallet> {
    const token = this.#getToken();
    const hdWallet = await this.#storage.getHDWallet(walletId);
    const groupAccounts = hdWallet.groupAccounts;
    const index = groupAccounts.length;
    const existAccount = groupAccounts.some((groupAccount) =>
      groupAccount.accounts.some((account) => account.accountId === accountId),
    );
    if (existAccount) {
      throw new Error("AccountId have existed");
    }
    const keyring = await HDKeyring.restore({
      walletId,
      token,
      mnemonic: hdWallet.mnemonic,
    });
    const newAccounts: AccountWithViewKey[] = [];
    for (let coinType of Object.values(CoinType)) {
      const newAccount = (await keyring.derive(
        nanoid(),
        index,
        coinType,
        token,
      )) as EncryptedKeyPairWithViewKey;
      const accountName = `Account ${index + 1}`;
      newAccounts.push({
        ...newAccount,
        accountName,
      });
    }
    const newGroupAccounts = [
      ...groupAccounts,
      {
        groupId: nanoid(),
        groupName: `Account ${index + 1}`,
        index,
        accounts: newAccounts,
      },
    ];
    const newHdWallet: HDWallet = {
      ...hdWallet,
      groupAccounts: newGroupAccounts,
    };
    await this.#storage.setHDWallet(newHdWallet, AccountMethod.ADD);

    return await this.getHDWallet(walletId);
  }

  async completeAccountsForHdWallet(): Promise<void> {
    console.log("=====> completeAccountsForHdWallet");
    const token = this.#getToken();
    const vaultV2 = await this.#storage.getVault();
    const keyringV2 = vaultV2[VaultKeys.keyring] ?? {};
    const hdWalletsV2 = keyringV2[WalletType.HD] || [];
    const hdWalletsPromise = hdWalletsV2.map(async (hdWalletV2) => {
      const { groupAccounts, ...restWallet } = hdWalletV2;
      const keyring = await HDKeyring.restore({
        walletId: hdWalletV2.walletId,
        token,
        mnemonic: hdWalletV2.mnemonic,
      });
      const newGroupAccountsPromise = groupAccounts.map(
        async (groupAccount) => {
          const { accounts, ...restGroup } = groupAccount;
          const newAccounts: AccountWithViewKey[] = [];
          for (let coinType of Object.values(CoinType)) {
            if (accounts.some((account) => account.coinType === coinType)) {
              continue;
            }
            const newAccount = (await keyring.derive(
              nanoid(),
              groupAccount.index,
              coinType,
              token,
            )) as EncryptedKeyPairWithViewKey;
            const accountName = `Account ${groupAccount.index + 1}`;
            newAccounts.push({
              ...newAccount,
              accountName,
            });
          }
          return {
            ...restGroup,
            accounts: [...accounts, ...newAccounts],
          } as GroupAccount;
        },
      );
      const newGroupAccounts = await Promise.all(newGroupAccountsPromise);
      return {
        ...restWallet,
        groupAccounts: newGroupAccounts,
      } as HDWallet;
    });
    const newHdWallets = await Promise.all(hdWalletsPromise);
    const newVault: Vault = {
      [VaultKeys.cipher]: vaultV2[VaultKeys.cipher],
      [VaultKeys.keyring]: {
        [WalletType.HD]: newHdWallets,
        [WalletType.SIMPLE]: keyringV2[WalletType.SIMPLE],
        version: vaultVersion,
      },
    };
    console.log("completeAccountsForHdWallet", newVault);
    await this.#storage.setVault(newVault);
  }

  async importPrivateKey<T extends CoinType>({
    walletId,
    walletName,
    coinType,
    privateKey,
    privateKeyType,
    option,
  }: ImportPrivateKeyProps<T>) {
    const token = this.#getToken();
    const simpleWallets = await this.#storage.getAllSimpleWallets();
    for (const wallet of simpleWallets) {
      for (let groupAccount of wallet.groupAccounts) {
        const account = groupAccount.accounts.find(
          (account) => account.coinType === coinType,
        );
        if (!account) {
          continue;
        }
        const existPrivateKey = await decryptStr(token, account.privateKey);
        if (existPrivateKey === privateKey) {
          throw new Error("PrivateKey exist!");
        }
      }
    }
    const account = coinBasicFactory(coinType).deriveAccount(
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
      groupAccounts: [
        {
          groupId: nanoid(),
          groupName: "Account 1",
          index: 0,
          accounts: [
            {
              ...account,
              index: 0,
              accountId: nanoid(),
              accountName: "Account 1",
              privateKey: privateKeyObj,
              coinType,
              option: {},
            },
          ],
        },
      ],
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
    for (let groupAccount of wallet.groupAccounts) {
      for (let account of groupAccount.accounts) {
        if (account.accountId === accountId && account.coinType === coinType) {
          const encryptedPrivateKey = account.privateKey;
          const privateKey = decryptStr(token, encryptedPrivateKey);
          return privateKey;
        }
      }
    }
    throw new Error("Account pk not found " + accountId);
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
        for (let groupAccount of wallet.groupAccounts) {
          for (let account of groupAccount.accounts) {
            if (
              account.address.toLowerCase() === address.toLowerCase() &&
              account.coinType === coinType
            ) {
              const encryptedPrivateKey = account.privateKey;
              const privateKey = decryptStr(token, encryptedPrivateKey);
              return privateKey;
            }
          }
        }
      }
    }
    if (simpleWallets) {
      for (const wallet of simpleWallets) {
        for (let groupAccount of wallet.groupAccounts) {
          for (let account of groupAccount.accounts) {
            if (
              account.address.toLowerCase() === address.toLowerCase() &&
              account.coinType === coinType
            ) {
              const encryptedPrivateKey = account.privateKey;
              const privateKey = decryptStr(token, encryptedPrivateKey);
              return privateKey;
            }
          }
        }
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
    if (coinType !== CoinType.ALEO) {
      throw new Error("do not support ViewKey");
    }
    const { HD: hdWallets, SIMPLE: simpleWallets } = keyring;
    if (hdWallets) {
      for (const wallet of hdWallets) {
        for (let groupAccount of wallet.groupAccounts) {
          for (let account of groupAccount.accounts) {
            if (account.address === address && account.coinType === coinType) {
              return (account as AccountWithViewKey).viewKey;
            }
          }
        }
      }
    }
    if (simpleWallets) {
      for (const wallet of simpleWallets) {
        for (let groupAccount of wallet.groupAccounts) {
          for (let account of groupAccount.accounts) {
            if (account.address === address && account.coinType === coinType) {
              return (account as AccountWithViewKey).viewKey;
            }
          }
        }
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


  async resetWallet() {
    return await this.#storage.resetWallet();
  }
}
