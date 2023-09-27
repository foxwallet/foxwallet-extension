import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { PageWithHeader } from "../../layouts/Page";
import { Body } from "../../layouts/Body";
import { OnboardProgress } from "../../components/Onboard/OnboardProgress";
import { ClientContext, useClient } from "../../hooks/useClient";
import { logger } from "../../common/utils/logger";
import { showMnemonicWarningDialog } from "../../components/Onboard/MnemonicWarningDialog";
import { nanoid } from "nanoid";
import { CreatePasswordStep } from "../../components/Onboard/CreatePassword";
import { ImportMnemonicStep } from "../../components/Onboard/ImportMnemonic";

const ImportWalletSteps = ["Create", "Import"];

export default function OnboardImportWallet() {
  const [step, setStep] = useState(2);
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
    const wallet = await popupServerClient.createWallet({
      walletName: walletNameRef.current,
      walletId,
      revealMnemonic: true,
    });
    const { confirmed } = await showMnemonicWarningDialog();
    if (confirmed) {
      setMnemonic(wallet.mnemonic || "");
    }
  }, []);

  const regenerateWallet = useCallback(async () => {
    const walletId = walletIdRef.current;
    const wallet = await popupServerClient.regenerateWallet({
      walletName: walletNameRef.current,
      walletId,
      revealMnemonic: true,
    });
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
          <ImportMnemonicStep
            onConfirm={(mnemonic) => {
              setStep((_step) => _step + 1);
            }}
          />
        );
    }
  }, [step, mnemonic, createWallet, regenerateWallet]);

  return (
    <PageWithHeader
      title="Import Wallet"
      enableBack={step === 1}
      onBack={() => {
        return true;
      }}
    >
      <Body>
        <OnboardProgress currStep={step} steps={ImportWalletSteps} />
        {stepContent}
      </Body>
    </PageWithHeader>
  );
}
