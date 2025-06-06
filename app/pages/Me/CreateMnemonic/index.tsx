import { BackupMnemonicStep } from "@/components/Onboard/BackupMnemonic";
import { ConfirmMnemonicStep } from "@/components/Onboard/ConfirmMnemonic";
// import { WalletNameStep } from "@/components/Setting/WalletName";
import { useClient } from "@/hooks/useClient";
import { usePopupDispatch } from "@/hooks/useStore";
import { Body } from "@/layouts/Body";
import { PageWithHeader } from "@/layouts/Page";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { defaultWalletNameSelector } from "@/store/selectors/account";
import { isEqual } from "lodash";

const CreateMnemonicScreen = () => {
  const [step, setStep] = useState(1);
  const defaultWalletName = useSelector(defaultWalletNameSelector, isEqual);
  const walletNameRef = useRef(defaultWalletName);
  const [mnemonic, setMnemonic] = useState("");
  const { popupServerClient } = useClient();
  const walletIdRef = useRef("");
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();

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
    await dispatch.accountV2.resyncAllWalletsToStore();

    dispatch.multiChain.addHdWalletChainItem({ walletId });

    setMnemonic(wallet.mnemonic ?? "");
  }, [dispatch, popupServerClient]);

  // const regenerateWallet = useCallback(async () => {
  // const walletId = walletIdRef.current;
  // const wallet = await popupServerClient.regenerateWallet({
  //   walletName: walletNameRef.current,
  //   walletId,
  //   revealMnemonic: true,
  // });
  // await dispatch.accountV2.resyncAllWalletsToStore();
  // setMnemonic(wallet.mnemonic ?? "");
  // }, [dispatch.accountV2]);

  const stepContent = useMemo(() => {
    switch (step) {
      // case 1:
      //   return (
      //     <WalletNameStep
      //       onConfirm={async (walletName) => {
      //         walletNameRef.current = walletName;
      //         setStep((_step) => _step + 1);
      //       }}
      //     />
      //   );
      case 1:
        return (
          <BackupMnemonicStep
            mnemonic={mnemonic}
            createWallet={createWallet}
            // regenerateWallet={regenerateWallet}
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
              dispatch.accountV2.changeWalletBackupedMnemonic({
                walletId: walletIdRef.current,
                backupedMnemonic: true,
              });
              navigate("/main");
            }}
          />
        );
    }
  }, [step, mnemonic, createWallet, dispatch, navigate]);

  return (
    <PageWithHeader
      title={t("Wallet:Create:title")}
      enableBack={step !== 1}
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

export default CreateMnemonicScreen;
