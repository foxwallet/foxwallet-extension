import { useClient } from "@/hooks/useClient";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { CoinType } from "core/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const ExportPrivateKeyScreen = () => {
  const { popupServerClient } = useClient();

  const navigate = useNavigate();
  const { walletId, accountId, coinType = CoinType.ALEO } = useParams();
  const { t } = useTranslation();
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");

  const fetchPrivateKey = useCallback(async () => {
    if (!walletId || !accountId) return;
    try {
      setError("");
      const res = await popupServerClient.getPrivateKey({
        walletId: walletId || "",
        accountId,
        coinType: coinType as CoinType,
      });
      setPrivateKey(res);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Failed to get private key";
      setPrivateKey("");
      setError(message);
      void showErrorToast({ message });
    }
  }, [popupServerClient, walletId, accountId, coinType]);

  useEffect(() => {
    void fetchPrivateKey();
  }, [fetchPrivateKey]);

  const tips = useMemo(() => {
    return [t("PrivateKey:backupTips1"), t("PrivateKey:backupTips2")];
  }, [t]);

  return (
    <PageWithHeader title="Backup private key">
      <Content>
        <Box p={2} mb={5} borderRadius={"lg"} bg={"gray.50"}>
          <Text wordBreak={"break-all"} color={error ? "red.500" : undefined}>
            {error || privateKey}
          </Text>
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
        <Button
          mt={20}
          onClick={() => {
            navigate(-1);
          }}
        >
          {t("Common:confirm")}
        </Button>
      </Content>
    </PageWithHeader>
  );
};

export default ExportPrivateKeyScreen;
