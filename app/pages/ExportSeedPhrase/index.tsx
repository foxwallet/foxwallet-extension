import { BackupMnemonicStep } from "@/components/Onboard/BackupMnemonic";
import { showMnemonicWarningDialog } from "@/components/Onboard/MnemonicWarningDialog";
import { useClient } from "@/hooks/useClient";
import { Body } from "@/layouts/Body";
import { PageWithHeader } from "@/layouts/Page";
import { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ExportSeedPhrase = () => {
  const { walletId } = useParams();
  const { popupServerClient } = useClient();
  const navigate = useNavigate();

  const [mnemonic, setMnemonic] = useState("");
  const hasPopuped = useRef(false);

  const createWallet = useCallback(async () => {
    if (hasPopuped.current) return;
    hasPopuped.current = true;

    const res = await popupServerClient.getHDMnemonic(walletId || "");
    const { confirmed } = await showMnemonicWarningDialog();
    if (confirmed) {
      setMnemonic(res);
    }
  }, [showMnemonicWarningDialog]);

  return (
    <PageWithHeader title={"Backup Seed Phrase"}>
      <Body>
        <BackupMnemonicStep
          mnemonic={mnemonic}
          createWallet={createWallet}
          onConfirm={() => navigate(-1)}
        />
      </Body>
    </PageWithHeader>
  );
};

export default ExportSeedPhrase;
