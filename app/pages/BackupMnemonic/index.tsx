import { BackupMnemonicStep } from "@/components/Onboard/BackupMnemonic";
import { ConfirmMnemonicStep } from "@/components/Onboard/ConfirmMnemonic";
import { showMnemonicWarningDialog } from "@/components/Onboard/MnemonicWarningDialog";
import { useClient } from "@/hooks/useClient";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { usePopupDispatch } from "@/hooks/useStore";
import { Body } from "@/layouts/Body";
import { PageWithHeader } from "@/layouts/Page";
import { CoinType } from "core/types";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BackupMnemonicScreen = () => {
  const { selectedAccount } = useCurrAccount();

  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef(selectedAccount.walletId);
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const hasPopuped = useRef(false);

  const regenerateWallet = useCallback(async () => {
    const walletId = walletIdRef.current;
    const prevWallet = await popupServerClient.getHDWallet(walletId);

    const wallet = await popupServerClient.regenerateWallet({
      walletName: prevWallet.walletName,
      walletId,
      revealMnemonic: true,
    });
    const coinType = CoinType.ALEO;
    const account = wallet.accountsMap[coinType][0];
    await dispatch.account.setSelectedAccount({
      selectedAccount: {
        walletId: wallet.walletId,
        coinType,
        ...account,
      },
    });
    setMnemonic(wallet.mnemonic ?? "");
  }, [setMnemonic, dispatch.account]);

  const createWallet = useCallback(async () => {
    if (hasPopuped.current) return;
    hasPopuped.current = true;

    const { confirmed } = await showMnemonicWarningDialog();
    if (confirmed) {
      regenerateWallet();
    }
  }, [regenerateWallet, showMnemonicWarningDialog]);

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <BackupMnemonicStep
            mnemonic={mnemonic}
            createWallet={createWallet}
            regenerateWallet={regenerateWallet}
            onConfirm={() => {
              setStep((_step) => _step + 1);
            }}
          />
        );
      case 2:
        return (
          <ConfirmMnemonicStep
            mnemonic={mnemonic}
            onConfirm={() => {
              dispatch.account.changeWalletBackupedMnemonic({
                walletId: walletIdRef.current,
                backupedMnemonic: true,
              });
              navigate("/main");
            }}
          />
        );
    }
  }, [
    dispatch.account,
    step,
    mnemonic,
    createWallet,
    regenerateWallet,
    navigate,
  ]);

  const title = useMemo(() => {
    if (step === 1) return "Backup Seed Phrase";
    return "Seed Phrase Verificatio";
  }, [step]);

  return (
    <PageWithHeader
      title={title}
      onBack={() => {
        if (step > 1) {
          setStep((curr) => curr - 1);
          return false;
        } else {
          return true;
        }
      }}
    >
      <Body>{stepContent}</Body>
    </PageWithHeader>
  );
};

export default BackupMnemonicScreen;
