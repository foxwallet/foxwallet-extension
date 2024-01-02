import { logger } from "@/common/utils/logger";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { ImportPrivateKeyStep } from "@/components/Onboard/ImportPrivateKey";
import { WalletNameStep } from "@/components/Setting/WalletName";
import { useClient } from "@/hooks/useClient";
import { usePopupDispatch } from "@/hooks/useStore";
import { Body } from "@/layouts/Body";
import { PageWithHeader } from "@/layouts/Page";
import { AleoImportPKType } from "core/coins/ALEO/types/AleoAccount";
import { CoinType } from "core/types";
import { sleep } from "core/utils/sleep";
import { nanoid } from "nanoid";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ImportPrivateKeyScreen = () => {
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
          <ImportPrivateKeyStep
            onConfirm={async (privateKey) => {
              const walletId = walletIdRef.current;
              const walletName = walletNameRef.current;
              if (walletId && walletName && privateKey) {
                try {
                  const coinType = CoinType.ALEO;
                  const wallet = await popupServerClient.importPrivateKey({
                    walletId,
                    walletName,
                    privateKey,
                    coinType,
                    privateKeyType: AleoImportPKType.ALEO_PK,
                  });
                  const account = wallet.accountsMap[coinType][0];
                  await dispatch.account.setSelectedAccount({
                    selectedAccount: {
                      walletId: wallet.walletId,
                      coinType,
                      ...account,
                    },
                  });
                  dispatch.account.changeWalletBackupedMnemonic({
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
  }, [step, popupServerClient]);

  return (
    <PageWithHeader
      title={t("Wallet:Import:importPrivateKey")}
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

export default ImportPrivateKeyScreen;
