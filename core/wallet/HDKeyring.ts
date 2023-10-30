import { type EncryptedField } from "../types/EncryptedField";
import { getCoinDerivation } from "../helper/CoinBasic";
import { type AccountOption } from "../types/CoinBasic";
import { CoinCurve } from "../types/CoinCurve";
import { type CoinType, Coins } from "../types/CoinType";
import {
  type ImportHdKeyringProps,
  type NewHdKeyringProps,
  type RestoreHdKeyringProps,
} from "../types/HDKeyring";
import {
  type EncryptedKeyPair,
  EncryptedKeyPairWithViewKey,
  RawKeyPair,
  RawKeyPairWithViewKey,
} from "../types/KeyPair";
import { decryptStr, encryptStr } from "../utils/encrypt";
import { type HDKey } from "./HDKey";
import { BLS12377HDKey } from "./HDKey/BLS12377HDKey";
import { EthHDKey } from "./HDKey/EthHDKey";
import { type BaseHDWallet, getHDWallet } from "./HDWallet/BaseHDWallet";
import { Mnemonic } from "./mnemonic";

type CoinsWallets = {
  [coinType in CoinType]?: BaseHDWallet<CoinType>;
};

export class HDKeyring {
  private mnemonic?: EncryptedField;
  // private secp256k1Root?: EthHDKey;
  private bls12377Root?: BLS12377HDKey;
  private coinWallets?: CoinsWallets;

  constructor(private readonly walletId: string) {}

  public static async init(opts: NewHdKeyringProps): Promise<HDKeyring> {
    const hdKeyring = new HDKeyring(opts.walletId);
    await hdKeyring.createNewMnemonic(opts.token);
    hdKeyring.initCheck();
    // await initAleoWasm();

    return hdKeyring;
  }

  public static async import(opts: ImportHdKeyringProps): Promise<HDKeyring> {
    const hdKeyring = new HDKeyring(opts.walletId);
    await hdKeyring.initFromMnemonic(opts.mnemonic);
    hdKeyring.initCheck();
    const encryptedMnemonic = await encryptStr(opts.token, opts.mnemonic);
    hdKeyring.mnemonic = encryptedMnemonic;
    return hdKeyring;
  }

  // restore HDKeyring from mnemonic after unlock
  public static async restore(opts: RestoreHdKeyringProps): Promise<HDKeyring> {
    const hdKeyring = new HDKeyring(opts.walletId);
    hdKeyring.mnemonic = opts.mnemonic;
    const mnemonic = await decryptStr(opts.token, opts.mnemonic);
    await hdKeyring.initFromMnemonic(mnemonic);
    hdKeyring.initCheck();
    return hdKeyring;
  }

  public getCoinRoot<T extends CoinType>(coin: T): HDKey[T] {
    const curve = getCoinDerivation(coin).curve;
    switch (curve) {
      // case CoinCurve.SECP256K1: {
      //   return this.secp256k1Root as HDKey[T];
      // }
      case CoinCurve.BLS12377: {
        return this.bls12377Root as HDKey[T];
      }
    }
  }

  public async createNewMnemonic(hash: string) {
    if (!this.coinWallets) {
      let mnemonic = "";
      mnemonic = await Mnemonic.generateUnique();
      this.mnemonic = await encryptStr(hash, mnemonic);
      await this.initFromMnemonic(mnemonic);
    } else {
      throw new Error("createNewMnemonic failed due to exist mnemonic");
    }
  }

  public async initFromMnemonic(mnemonic: string) {
    const seed = Mnemonic.toSeed(mnemonic);
    // this.secp256k1Root = EthHDKey.fromMasterSeed(seed);
    this.bls12377Root = BLS12377HDKey.fromMasterSeed(seed);
    this.coinWallets = {};
  }

  public initCheck() {
    if (!this.coinWallets) {
      throw new Error("hdKeyring.coinWallets init error");
    }
    // if (!this.secp256k1Root) {
    //   throw new Error("hdKeyring.secp256k1Root init error");
    // }
    if (!this.bls12377Root) {
      throw new Error("hdKeyring.bls12377Root init error");
    }
  }

  getWallet<T extends CoinType>(symbol: T): BaseHDWallet<T> {
    if (!this.coinWallets) {
      this.coinWallets = {};
    }
    if (!this.coinWallets[symbol]) {
      this.coinWallets[symbol] = getHDWallet<CoinType>(
        this.getCoinRoot(symbol),
        {
          symbol,
        },
      );
    }
    return this.coinWallets[symbol]! as BaseHDWallet<T>;
  }

  public async derive<T extends CoinType>(
    accountId: string,
    index: number,
    symbol: T,
    token: string,
    option?: AccountOption[T],
  ): Promise<EncryptedKeyPair> {
    this.initCheck();
    const coinWallet = this.getWallet(symbol);
    if (!coinWallet) {
      throw new Error(`no ${symbol} wallet in ${accountId}`);
    }
    const encryptedKeyPair = await coinWallet.derive(
      index,
      accountId,
      token,
      option,
    );
    return encryptedKeyPair;
  }

  getWalletId() {
    return this.walletId;
  }

  getEncryptedMnemonic(): EncryptedField | undefined {
    return this.mnemonic;
  }
}
