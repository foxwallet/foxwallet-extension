import { Buffer } from "buffer";
import crypto from "crypto-browserify";

const HARDENED_OFFSET = 0x80000000;
const BLS12_377_CURVE = "bls12_377 seed";
interface IKeys {
  key: Buffer;
  chainCode: Buffer;
}

const replaceDerive = (val: string): string => val.replace("'", "");

const pathRegex = new RegExp("^m(\\/[0-9]+')+$");

const CKDPriv = ({ key, chainCode }: IKeys, index: number): IKeys => {
  const indexBuffer = Buffer.allocUnsafe(4);
  indexBuffer.writeUInt32BE(index, 0);

  const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);

  const I = crypto.createHmac("sha512", chainCode).update(data).digest();
  const IL = I.slice(0, 32);
  const IR = I.slice(32);
  return {
    key: IL,
    chainCode: IR,
  };
};

const isValidPath = (path: string): boolean => {
  if (!pathRegex.test(path)) {
    return false;
  }
  return !path
    .split("/")
    .slice(1)
    .map(replaceDerive)
    .some(isNaN as any /* ts T_T*/);
};

export const getMasterKeyFromSeed = (seed: string): IKeys => {
  const hmac = crypto.createHmac("sha512", BLS12_377_CURVE);
  const I = hmac.update(Buffer.from(seed, "hex")).digest();
  const IL = I.slice(0, 32);
  const IR = I.slice(32);
  return {
    key: IL,
    chainCode: IR,
  };
};

export class BLS12377HDKey {
  public static fromMasterSeed(seed: Buffer): BLS12377HDKey {
    const masterKey = getMasterKeyFromSeed(seed.toString("hex"));
    return new BLS12377HDKey(masterKey.key, masterKey.chainCode);
  }
  constructor(
    public key: Buffer,
    public chainCode: Buffer
  ) {}

  public derive(path: string): BLS12377HDKey {
    if (!isValidPath(path)) {
      throw new Error("Invalid derivation path");
    }

    const segments = path
      .split("/")
      .slice(1)
      .map(replaceDerive)
      .map((el) => parseInt(el, 10));

    const keys = segments.reduce(
      (parentKeys, segment) => CKDPriv(parentKeys, segment + HARDENED_OFFSET),
      { key: this.key, chainCode: this.chainCode }
    );
    return new BLS12377HDKey(keys.key, keys.chainCode);
  }

  public derivePath(path: string): BLS12377HDKey {
    return this.derive(path);
  }

  public deriveChild(index: number): BLS12377HDKey {
    return this.derive(`m/${index}'/0'`);
  }
}
