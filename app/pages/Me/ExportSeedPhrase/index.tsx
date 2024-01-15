import { BackupMnemonicStep } from "@/components/Onboard/BackupMnemonic";
import { showMnemonicWarningDialog } from "@/components/Onboard/MnemonicWarningDialog";
import { useClient } from "@/hooks/useClient";
import { Body } from "@/layouts/Body";
import { PageWithHeader } from "@/layouts/Page";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const ExportSeedPhrase = () => {
  const { walletId } = useParams();
  const { popupServerClient } = useClient();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [mnemonic, setMnemonic] = useState("");

  useEffect(() => {
    const fetchMnemonic = async () => {
      const mnemonic = await popupServerClient.getHDMnemonic(walletId!);
      setMnemonic(mnemonic);
    };
    fetchMnemonic();
  }, [walletId]);

  return (
    <PageWithHeader title={t("Mnemonic:backup")}>
      <Body>
        <BackupMnemonicStep
          mnemonic={mnemonic}
          onConfirm={() => navigate(-1)}
        />
      </Body>
    </PageWithHeader>
  );
};

export default ExportSeedPhrase;
