export enum QTUMImportPKType {
  QTUM_WIF = "QTUM_WIF",
}

export enum QTUMExportPKType {
  QTUM_WIF = "QTUM_WIF",
}

export enum QTUMNetwork {
  qtum = "mainnet",
  qtumTestnet = "testnet",
}

export type QTUMAccountOption = {
  payment?: "p2pkh" | "p2sh" | "p2wpkh" | "p2tr";
  network?: QTUMNetwork;
};

export const DEFAULT_QTUM_ACCOUNT_OPTION: QTUMAccountOption = {
  payment: "p2pkh",
  network: QTUMNetwork.qtum,
};

export const QTUM_TESTNET_ACCOUNT_OPTION: QTUMAccountOption = {
  payment: "p2pkh",
  network: QTUMNetwork.qtumTestnet,
};
