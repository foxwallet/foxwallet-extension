import { H1, H3, H6 } from "@/common/theme/components/text";
import { useClient } from "@/hooks/useClient";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { TabPanel } from "@chakra-ui/react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CreateWalletScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "Setting:CreateWallet",
  });
  const { selectedAccount, uniqueId } = useCurrAccount();

  const createMnemonic = useCallback(() => {
    navigate("/create_mnemonic");
  }, [navigate]);

  const importMnemonic = useCallback(() => {
    navigate("/import_mnemonic");
  }, [navigate]);

  const importPrivateKey = useCallback(() => {
    navigate("/import_private_key");
  }, [navigate]);

  return (
    <PageWithHeader title={t("selectType")} enableBack>
      <Content>
        <H6 onClick={() => createMnemonic()}>{t("createMnemonic")}</H6>
        <H6 onClick={() => importMnemonic()}>{t("importMnemonic")}</H6>
        <H6 onClick={() => importPrivateKey()}>{t("importPrivateKey")}</H6>
      </Content>
    </PageWithHeader>
  );
};

export default CreateWalletScreen;
