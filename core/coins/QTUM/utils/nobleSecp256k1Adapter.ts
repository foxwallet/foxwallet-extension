/**
 * Adapter that implements ecpair's TinySecp256k1Interface
 * using pure-JS @noble/secp256k1@2.x + @noble/hashes@1.x
 * instead of WASM-based tiny-secp256k1.
 */
import * as secp from "@noble/secp256k1";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha256";

// Required: provide hmacSha256Sync so secp.sign works synchronously
secp.etc.hmacSha256Sync = (k: Uint8Array, ...m: Uint8Array[]) =>
  hmac(sha256, k, secp.etc.concatBytes(...m));

// --- helpers ---

function bytesToBigInt(bytes: Uint8Array): bigint {
  return secp.etc.bytesToNumberBE(bytes);
}

function bigIntToBytes(n: bigint, length: number): Uint8Array {
  return secp.etc.numberToBytesBE(n, length);
}

// --- TinySecp256k1Interface implementation ---

function isPoint(p: Uint8Array): boolean {
  try {
    secp.ProjectivePoint.fromHex(p);
    return true;
  } catch {
    return false;
  }
}

function pointCompress(p: Uint8Array, compressed = true): Uint8Array {
  const point = secp.ProjectivePoint.fromHex(p);
  return point.toRawBytes(compressed);
}

function isPrivate(d: Uint8Array): boolean {
  return secp.utils.isValidPrivateKey(d);
}

function pointFromScalar(
  d: Uint8Array,
  compressed = true,
): Uint8Array | null {
  try {
    return secp.getPublicKey(d, compressed);
  } catch {
    return null;
  }
}

function xOnlyPointAddTweak(
  p: Uint8Array,
  tweak: Uint8Array,
): { parity: 0 | 1; xOnlyPubkey: Uint8Array } | null {
  try {
    // Lift x-only (32 bytes) to full compressed point (assume even parity)
    const fullKey = new Uint8Array(33);
    fullKey[0] = 0x02;
    fullKey.set(p, 1);
    const P = secp.ProjectivePoint.fromHex(fullKey);

    const t = bytesToBigInt(tweak);
    if (t >= secp.CURVE.n) return null;

    // T = t * G
    const T = secp.ProjectivePoint.BASE.multiply(t);
    const Q = P.add(T);
    if (Q.equals(secp.ProjectivePoint.ZERO)) return null;

    const Qaff = Q.toAffine();
    const parity = (Qaff.y & 1n) === 0n ? 0 : 1;
    const xOnlyPubkey = bigIntToBytes(Qaff.x, 32);
    return { parity: parity as 0 | 1, xOnlyPubkey };
  } catch {
    return null;
  }
}

function privateAdd(
  d: Uint8Array,
  tweak: Uint8Array,
): Uint8Array | null {
  try {
    const dBig = bytesToBigInt(d);
    const tBig = bytesToBigInt(tweak);
    const n = secp.CURVE.n;
    const sum = secp.etc.mod(dBig + tBig, n);
    if (sum === 0n) return null;
    return bigIntToBytes(sum, 32);
  } catch {
    return null;
  }
}

function privateNegate(d: Uint8Array): Uint8Array {
  const dBig = bytesToBigInt(d);
  const n = secp.CURVE.n;
  return bigIntToBytes(secp.etc.mod(n - dBig, n), 32);
}

function sign(
  h: Uint8Array,
  d: Uint8Array,
  e?: Uint8Array,
): Uint8Array {
  const sig = secp.sign(h, d, { extraEntropy: e, lowS: true });
  return sig.toCompactRawBytes();
}

function verify(
  h: Uint8Array,
  Q: Uint8Array,
  signature: Uint8Array,
  strict?: boolean,
): boolean {
  try {
    const sig = secp.Signature.fromCompact(signature);
    return secp.verify(sig, h, Q, { lowS: strict !== false });
  } catch {
    return false;
  }
}

// --- export the adapter object ---

export const ecc = {
  isPoint,
  pointCompress,
  isPrivate,
  pointFromScalar,
  xOnlyPointAddTweak,
  privateAdd,
  privateNegate,
  sign,
  verify,
};
