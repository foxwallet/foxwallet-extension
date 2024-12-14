import { logger } from "@/common/utils/logger";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { ImportMnemonicStep } from "@/components/Onboard/ImportMnemonic";
import { WalletNameStep } from "@/components/Setting/WalletName";
import { useClient } from "@/hooks/useClient";
import { usePopupDispatch } from "@/hooks/useStore";
import { Body } from "@/layouts/Body";
import { PageWithHeader } from "@/layouts/Page";
import { CoinType } from "core/types";
import { sleep } from "core/utils/sleep";
import { nanoid } from "nanoid";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ImportMnemonicScreen = () => {
  const [step, setStep] = useState(1);
  const walletNameRef = useRef("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef("");
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <WalletNameStep
            onConfirm={async (walletName) => {
              walletNameRef.current = walletName;
              walletIdRef.current = nanoid();
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
                  dispatch.multiChain.addHdWalletChainItem({ walletId });
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
  }, [step, popupServerClient, dispatch, navigate]);

  return (
    <PageWithHeader
      title={t("Wallet:Import:importMnemonic")}
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
};

export default ImportMnemonicScreen;
