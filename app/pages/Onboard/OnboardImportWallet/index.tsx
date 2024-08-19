import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { PageWithHeader } from "../../../layouts/Page";
import { Body } from "../../../layouts/Body";
import { OnboardProgress } from "../../../components/Onboard/OnboardProgress";
import { useClient } from "../../../hooks/useClient";
import { logger } from "../../../common/utils/logger";
import { showMnemonicWarningDialog } from "../../../components/Onboard/MnemonicWarningDialog";
import { nanoid } from "nanoid";
import { CreatePasswordStep } from "../../../components/Onboard/CreatePassword";
import { ImportMnemonicStep } from "../../../components/Onboard/ImportMnemonic";
import { showErrorToast } from "../../../components/Custom/ErrorToast";
import { usePopupDispatch } from "@/hooks/useStore";
import { sleep } from "core/utils/sleep";
import { useNavigate } from "react-router-dom";
import { CoinType } from "core/types";
import { useTranslation } from "react-i18next";

export default function OnboardImportWallet() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const walletNameRef = useRef("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef("");
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();

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
                  const wallet = await popupServerClient.importHDWallet({
                    walletId,
                    walletName,
                    mnemonic: mnemonic.trim(),
                  });
                  await dispatch.accountV2.resyncAllWalletsToStore();
                  dispatch.accountV2.changeWalletBackupedMnemonic({
                    walletId: wallet.walletId,
                    backupedMnemonic: true,
                  });
                  await sleep(500);
                  navigate("/");
                } catch (err) {
                  if (err instanceof Error) {
                    void showErrorToast({ message: err.message });
                  }
                }
              } else {
                logger.error("import mnemonic failed: ", walletId, walletName);
              }
            }}
          />
        );
    }
  }, [step, popupServerClient, dispatch.accountV2]);

  return (
    <PageWithHeader
      title={t("Wallet:Import:title")}
      enableBack={true}
      onBack={() => {
        if (step > 1) {
          setStep((_step) => _step - 1);
          return false;
        }
        return true;
      }}
    >
      <Body>{stepContent}</Body>
    </PageWithHeader>
  );
}
