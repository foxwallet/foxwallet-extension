import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CreateWalletScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    <PageWithHeader title={t("Wallet:Manage:addWallet")} enableBack>
      <Content>
        <Flex flexDir={"column"} h={"full"} justify={"center"} align={"center"}>
          <Button onClick={() => createMnemonic()} alignSelf={"stretch"}>
            {t("Wallet:Create:title")}
          </Button>
          <Text color={"gray.500"} fontSize={"smaller"} mt={2}>
            {t("Wallet:Create:explain")}
          </Text>
          <Button mt={6} onClick={() => importMnemonic()} alignSelf={"stretch"}>
            {t("Wallet:Import:importMnemonic")}
          </Button>
          <Text color={"gray.500"} fontSize={"smaller"} mt={2}>
            {t("Wallet:Import:importMnemonicExplain")}
          </Text>
          <Button
            mt={6}
            onClick={() => importPrivateKey()}
            alignSelf={"stretch"}
          >
            {t("Wallet:Import:importPrivateKey")}
          </Button>
          <Text color={"gray.500"} fontSize={"smaller"} mt={2}>
            {t("Wallet:Import:importPrivateKeyExplain")}
          </Text>
        </Flex>
      </Content>
    </PageWithHeader>
  );
};

export default CreateWalletScreen;
