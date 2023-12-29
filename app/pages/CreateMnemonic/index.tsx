import { H1, H3, H6 } from "@/common/theme/components/text";
import { BackupMnemonicStep } from "@/components/Onboard/BackupMnemonic";
import { ConfirmMnemonicStep } from "@/components/Onboard/ConfirmMnemonic";
import { showMnemonicWarningDialog } from "@/components/Onboard/MnemonicWarningDialog";
import { WalletNameStep } from "@/components/Setting/WalletName";
import { useClient } from "@/hooks/useClient";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { usePopupDispatch } from "@/hooks/useStore";
import { Body } from "@/layouts/Body";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { TabPanel } from "@chakra-ui/react";
import { CoinType } from "core/types";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CreateMnemonicScreen = () => {
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

    const coinType = CoinType.ALEO;
    const account = wallet.accountsMap[coinType][0];
    await dispatch.account.setSelectedAccount({
      selectedAccount: {
        walletId: wallet.walletId,
        coinType,
        ...account,
      },
    });
    const { confirmed } = await showMnemonicWarningDialog();
    if (confirmed) {
      setMnemonic(wallet.mnemonic ?? "");
    }
  }, []);

  const regenerateWallet = useCallback(async () => {
    const walletId = walletIdRef.current;
    const wallet = await popupServerClient.regenerateWallet({
      walletName: walletNameRef.current,
      walletId,
      revealMnemonic: true,
    });
    const coinType = CoinType.ALEO;
    const account = wallet.accountsMap[coinType][0];
    await dispatch.account.setSelectedAccount({
      selectedAccount: {
        walletId: wallet.walletId,
        coinType,
        ...account,
      },
    });
    setMnemonic(wallet.mnemonic ?? "");
  }, []);

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <WalletNameStep
            onConfirm={async (walletName) => {
              walletNameRef.current = walletName;
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
  }, [step, mnemonic, createWallet, regenerateWallet]);

  return (
    <PageWithHeader
      title="Create Wallet"
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
};

export default CreateMnemonicScreen;
