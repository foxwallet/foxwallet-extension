import { useCallback, useMemo, useRef, useState } from "react";
import { PageWithHeader } from "../../../layouts/Page";
import { Body } from "../../../layouts/Body";
import { useClient } from "../../../hooks/useClient";
import { CreatePasswordStep } from "../../../components/Onboard/CreatePassword";
import { BackupMnemonicStep } from "../../../components/Onboard/BackupMnemonic";
import { logger } from "../../../common/utils/logger";
import { ConfirmMnemonicStep } from "../../../components/Onboard/ConfirmMnemonic";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import { usePopupDispatch } from "@/hooks/useStore";
import { CoinType } from "core/types";
import { useTranslation } from "react-i18next";
import { showErrorToast } from "@/components/Custom/ErrorToast";

function OnboardCreateWalletScreen() {
  const [step, setStep] = useState(1);
  const walletNameRef = useRef("");
  const [mnemonic, setMnemonic] = useState("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef("");
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();

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
    await dispatch.account.resyncAllWalletsToStore();
    setMnemonic(wallet.mnemonic ?? "");
  }, []);

  const regenerateWallet = useCallback(async () => {
    try {
      const walletId = walletIdRef.current;
      const wallet = await popupServerClient.regenerateWallet({
        walletName: walletNameRef.current,
        walletId,
        revealMnemonic: true,
      });
      await dispatch.account.resyncAllWalletsToStore();
      setMnemonic(wallet.mnemonic ?? "");
    } catch (err) {
      showErrorToast({ message: "Regenerate Failed" });
    }
  }, []);

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <CreatePasswordStep
            onConfirm={async (walletName, password) => {
              walletNameRef.current = walletName;
              const res = await popupServerClient.initPassword({ password });
              logger.log("===> create wallet PasswordStep: ", res);
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
              dispatch.account.changeWalletBackupedMnemonic({
                walletId: walletIdRef.current,
                backupedMnemonic: true,
              });
              navigate("/main");
            }}
          />
        );
    }
  }, [step, mnemonic, createWallet]);

  const { t } = useTranslation();
  const CreateWalletSteps = useMemo(
    () => [
      t("Wallet:Create:title"),
      t("Wallet:Create:backupMnemonic"),
      t("Wallet:Create:confirmMnemonic"),
    ],
    [t],
  );
  return (
    <PageWithHeader
      title={CreateWalletSteps[step - 1]}
      enableBack={step !== 2}
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
}

export default OnboardCreateWalletScreen;
