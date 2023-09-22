import { useContext, useMemo, useRef, useState } from "react";
import { PageWithHeader } from "../../layouts/Page";
import { Body } from "../../layouts/Body";
import { OnboardProgress } from "../../components/OnboardProgress";
import { ClientContext, useClient } from "../../hooks/useClient";
import { CreatePasswordStep } from "./CreatePasswordStep";
import { BackupMnemonicStep } from "./BackupMnemonic";
import { logger } from "../../common/utils/logger";

function OnboardCreateWalletScreen() {
  const [step, setStep] = useState(1);
  const walletNameRef = useRef("");
  const { popupServerClient } = useClient();

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
            walletName={walletNameRef.current}
            onConfirm={() => {
              setStep((_step) => _step + 1);
            }}
          />
        );
      case 3:
        return null;
    }
  }, [step]);

  return (
    <PageWithHeader title="Create Wallet" enableBack>
      <Body>
        <OnboardProgress currStep={step} />
        {stepContent}
      </Body>
    </PageWithHeader>
  );
}

export default OnboardCreateWalletScreen;
