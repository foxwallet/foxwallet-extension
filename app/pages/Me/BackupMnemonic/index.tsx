import { BackupMnemonicStep } from "@/components/Onboard/BackupMnemonic";
import { ConfirmMnemonicStep } from "@/components/Onboard/ConfirmMnemonic";
import { useClient } from "@/hooks/useClient";
import { usePopupDispatch } from "@/hooks/useStore";
import { Body } from "@/layouts/Body";
import { PageWithHeader } from "@/layouts/Page";
import { CoinType } from "core/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const BackupMnemonicScreen = () => {
  const { walletId: walletIdFromRoute } = useParams();

  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef(walletIdFromRoute || "");
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchMnemonic = async () => {
      const mnemonic = await popupServerClient.getHDMnemonic(
        walletIdRef.current,
      );
      setMnemonic(mnemonic);
    };
    fetchMnemonic();
  }, [popupServerClient]);

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <BackupMnemonicStep
            mnemonic={mnemonic}
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
  }, [dispatch.account, step, mnemonic, navigate]);

  const title = useMemo(() => {
    if (step === 1) return t("Menmonic:backup");
    return t("Mnemonic:verification");
  }, [step, t]);

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
