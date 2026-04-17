import type { Network } from "bitcoinjs-lib";

export const qtumNetwork: Network = {
  messagePrefix: "\x15Qtum Signed Message:\n",
  bech32: "qc",
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x3a,
  scriptHash: 0x32,
  wif: 0x80,
};

export const qtumTestnetNetwork: Network = {
  messagePrefix: "\x15Qtum Signed Message:\n",
  bech32: "tq",
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x78,
  scriptHash: 0x6e,
  wif: 0xef,
};

// UTXO transaction size estimation (vBytes)
export const InputSizeMap = {
  p2pkh: 147.5,
  p2sh_p2wpkh: 91,
  p2wpkh: 68.5,
  p2tr: 58,
};

export const OutputSizeMap = {
  p2pkh: 34,
  p2sh: 32,
  p2wpkh: 31,
  p2tr: 43,
};

export const txBaseVBytes = 10;

// Dust limit (satoshi)
export const DUST_LIMIT = 182 * 400; // 72,800 satoshi

// Staking maturity confirmations
export const MATURE_CONFIRMATIONS = 2000;

// Default fee rate (sat/byte)
export const DEFAULT_FEE_RATE = 400;
