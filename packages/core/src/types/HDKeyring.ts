export type NewHdKeyringProps = {
  walletId: string;
};

export type RestoreHdKeyringProps = {
  walletId: string;
  mnemonic: string;
  encrypted: boolean;
}