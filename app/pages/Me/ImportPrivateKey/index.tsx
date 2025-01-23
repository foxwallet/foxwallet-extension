import { logger } from "@/common/utils/logger";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { ImportPrivateKeyStep } from "@/components/Onboard/ImportPrivateKey";
// import { WalletNameStep } from "@/components/Setting/WalletName";
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
import { useSelector } from "react-redux";
import { defaultWalletNameSelector } from "@/store/selectors/account";
import { isEqual } from "lodash";
import { AleoImportPKType } from "core/coins/ALEO/types/AleoAccount";
import { ETHImportPKType } from "core/coins/ETH/types/ETHAccount";

const ImportPrivateKeyScreen = () => {
  const [step, setStep] = useState(1);
  const defaultWalletName = useSelector(defaultWalletNameSelector, isEqual);
  const walletNameRef = useRef(defaultWalletName);
  const { popupServerClient } = useClient();
  const walletIdRef = useRef(nanoid());
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();

  const stepContent = useMemo(() => {
    switch (step) {
      // case 1:
      //   return (
      //     <WalletNameStep
      //       onConfirm={async (walletName) => {
      //         walletNameRef.current = walletName;
      //         walletIdRef.current = nanoid();
      //         setStep((_step) => _step + 1);
      //       }}
      //     />
      //   );
      case 1:
        return (
          <ImportPrivateKeyStep
            onConfirm={async (privateKey, paramCoinType) => {
              const walletId = walletIdRef.current;
              const walletName = walletNameRef.current;
              const coinType = paramCoinType as CoinType;
              const privateKeyType =
                coinType === CoinType.ALEO
                  ? AleoImportPKType.ALEO_PK
                  : ETHImportPKType.ETH_HEX;

              if (walletId && walletName && privateKey) {
                try {
                  const wallet = await popupServerClient.importPrivateKey({
                    walletId,
                    walletName,
                    privateKey,
                    coinType,
                    privateKeyType,
                    option: {},
                  });
                  const { groupAccounts, ...restWallet } = wallet;
                  const groupAccount = wallet.groupAccounts[0];
                  await dispatch.accountV2.setSelectedGroupAccount({
                    selectedGroupAccount: {
                      wallet: restWallet,
                      group: groupAccount,
                    },
                  });
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
  }, [step, popupServerClient, dispatch.accountV2, navigate]);

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
