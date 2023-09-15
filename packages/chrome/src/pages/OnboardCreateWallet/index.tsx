import { useContext, useMemo, useRef, useState } from "react";
import { PageWithHeader } from "../../layouts/Page";
import { Body } from "../../layouts/Body";
import { OnboardProgress } from "../../components/OnboardProgress";
import { ClientContext } from "../../hooks/useClient";
import { CreatePasswordStep } from "./CreatePasswordStep";
import { BackupMnemonicStep } from "./BackupMnemonic";
import { logger } from "../../common/utils/logger";

function OnboardCreateWalletScreen() {
  const { popupServerClient } = useContext(ClientContext);
  const [step, setStep] = useState(1);
  const walletNameRef = useRef("");

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <CreatePasswordStep
            onConfirm={async (walletName, password) => {
              walletNameRef.current = walletName;
              const res = await popupServerClient.initPassword({ password });
              logger.log("=> res: ", res);
              setStep((_step) => _step + 1);
            }}
          />
        );
      case 2:
        return (
          <BackupMnemonicStep
            onConfirm={() => {
              setStep((_step) => _step + 1);
            }}
          />
        );
      case 3:
        return null;
    }
  }, [step, popupServerClient]);

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
