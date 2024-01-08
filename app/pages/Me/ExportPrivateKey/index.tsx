import { useClient } from "@/hooks/useClient";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { CoinType } from "core/types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const tips = [
  "Please note down the seed phrase in order.",
  "Please copy and keep it in a safe place.",
  "Seed phrase or private key are the only way to recover your wallet. Once lost, it cannot be retrieved. Do not save them via screenshots or social medias.",
];

const ExportPrivateKeyScreen = () => {
  const { popupServerClient } = useClient();

  const navigate = useNavigate();
  const { walletId, accountId, coinType = CoinType.ALEO } = useParams();
  const { t } = useTranslation();
  const [privateKey, setPrivateKey] = useState("");

  const fetchPrivateKey = useCallback(async () => {
    if (!walletId || !accountId) return;
    const res = await popupServerClient.getPrivateKey({
      walletId: walletId || "",
      accountId,
      coinType: coinType as CoinType,
    });
    setPrivateKey(res);
  }, [popupServerClient.getPrivateKey, walletId, accountId]);

  useEffect(() => {
    fetchPrivateKey();
  }, [fetchPrivateKey]);

  return (
    <PageWithHeader title="Backup private key">
      <Content>
        <Box p={2} mb={5} borderRadius={"lg"} bg={"gray.50"}>
          <Text>{privateKey}</Text>
        </Box>
        <Flex
          flexDirection={"column"}
          borderRadius={"lg"}
          borderStyle={"solid"}
          borderWidth={"2px"}
          borderColor={"gray.50"}
          p={2}
        >
          {tips.map((tip, index) => (
            <Flex mt={1} key={index}>
              <Box mt={1.5} w={1.5} h={1.5} borderRadius={3} bg={"gray.500"} />
              <Text ml={2} fontSize={"small"} color={"gray.600"} maxW={"95%"}>
                {tip}
              </Text>
            </Flex>
          ))}
        </Flex>
        <Button mt={20} onClick={() => navigate(-1)}>
          {t("Common:confirm")}
        </Button>
      </Content>
    </PageWithHeader>
  );
};

export default ExportPrivateKeyScreen;
