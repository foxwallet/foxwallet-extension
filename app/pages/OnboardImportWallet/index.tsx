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
import { showMessageToast } from "../../components/Custom/ErrorToast";

const ImportWalletSteps = ["Create", "Import"];

export default function OnboardImportWallet() {
  const [step, setStep] = useState(1);
  const walletNameRef = useRef("");
  const [mnemonic, setMnemonic] = useState("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef("");

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <CreatePasswordStep
            onConfirm={async (walletName, password) => {
              walletNameRef.current = walletName;
              walletIdRef.current = nanoid();
              const res = await popupServerClient.initPassword({ password });
              logger.log("===> import wallet PasswordStep: ", res);
              setStep((_step) => _step + 1);
            }}
          />
        );
      case 2:
        return (
          <ImportMnemonicStep
            onConfirm={async (mnemonic) => {
              const walletId = walletIdRef.current;
              const walletName = walletNameRef.current;
              if (walletId && walletName && mnemonic) {
                try {
                  await popupServerClient.importHDWallet({
                    walletId,
                    walletName,
                    mnemonic,
                  });
                } catch (err) {
                  if (err instanceof Error) {
                    showMessageToast({ message: err.message });
                  }
                }
              } else {
                logger.error("import mnemonic failed: ", walletId, walletName);
              }
            }}
          />
        );
    }
  }, [step, popupServerClient]);

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
