import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { PageWithHeader } from "../../layouts/Page";
import { Body } from "../../layouts/Body";
import { OnboardProgress } from "../../components/Onboard/OnboardProgress";
import { ClientContext, useClient } from "../../hooks/useClient";
import { CreatePasswordStep } from "../../components/Onboard/CreatePassword";
import { BackupMnemonicStep } from "../../components/Onboard/BackupMnemonic";
import { logger } from "../../common/utils/logger";
import { ConfirmMnemonicStep } from "../../components/Onboard/ConfirmMnemonic";
import { showMnemonicWarningDialog } from "../../components/Onboard/MnemonicWarningDialog";
import { nanoid } from "nanoid";

const CreateWalletSteps = [
  "Create",
  "Backup",
  "Confirm"
]

function OnboardCreateWalletScreen() {
  const [step, setStep] = useState(1);
  const walletNameRef = useRef("");
  const [mnemonic, setMnemonic] = useState("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef("");


  const createWallet = useCallback(async () => {
    if (walletIdRef.current) {
      return;
    }
    const walletId = nanoid();
    walletIdRef.current = walletId;
    const wallet = await popupServerClient
      .createWallet({ walletName: walletNameRef.current, walletId, revealMnemonic: true });
    const { confirmed } = await showMnemonicWarningDialog();
    if (confirmed) {
      setMnemonic(wallet.mnemonic || "");
    }
  }, []);

  const regenerateWallet = useCallback(async () => {
    const walletId = walletIdRef.current;
    const wallet = await popupServerClient
      .regenerateWallet({ walletName: walletNameRef.current, walletId, revealMnemonic: true });
    setMnemonic(wallet.mnemonic || "");
  }, []);

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <CreatePasswordStep
            onConfirm={async (walletName, password) => {
              walletNameRef.current = walletName;
              const res = await popupServerClient.initPassword({ password });
              logger.log("===> initPasswordres: ", res);
              setStep((_step) => _step + 1);
            }}
          />
        );
      case 2:
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
      case 3:
        return (
          <ConfirmMnemonicStep
            mnemonic={mnemonic}
            onConfirm={() => {
            }}
          />
        );
    }
  }, [step, mnemonic, createWallet, regenerateWallet]);

  return (
    <PageWithHeader title="Create Wallet" enableBack={step !== 2} onBack={() => {
      if (step > 1) {
        setStep((curr) => curr - 1);
        return false;
      } else {
        return true;
      }
    }}>
      <Body>
        <OnboardProgress currStep={step} steps={CreateWalletSteps} />
        {stepContent}
      </Body>
    </PageWithHeader>
  );
}

export default OnboardCreateWalletScreen;
