import { ERROR_CODE } from "@/common/types/error";
import { IconFoxWallet, IconLogo } from "@/components/Custom/Icon";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { AccountInfo } from "@/components/Dapp/AccountInfo";
import { DappInfo } from "@/components/Dapp/DappInfo";
import { useClient } from "@/hooks/useClient";
import { useDappRequest } from "@/hooks/useDappRequest";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text } from "@chakra-ui/react";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

function DeploymentScreen() {
  const navigate = useNavigate();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, [getMatchAccountsWithUniqueId]);
  const { requestId } = useParams();
  const { popupServerClient } = useClient();
  const { dappRequest, loading } = useDappRequest(requestId);
  const { t } = useTranslation();

  const dappRequestInfo = useMemo(() => {
    if (!dappRequest) {
      return null;
    }
    const { payload } = dappRequest;
    const { programId, program, chainId } = payload;
    return (
      <Flex
        direction={"column"}
        alignSelf={"stretch"}
        borderRadius={"lg"}
        borderStyle={"solid"}
        borderWidth={"1px"}
        borderColor={"gray.50"}
        flex={1}
        maxH={200}
        overflowY={"auto"}
        p={2}
      >
        <Flex justify={"space-between"}>
          <Text>{t("Dapp:network")}</Text>
          <Text>{chainId}</Text>
        </Flex>
        <Flex justify={"space-between"}>
          <Text>{t("Dapp:program")}</Text>
          <Text maxW={"70%"} wordBreak={"break-all"}>
            {programId}
          </Text>
        </Flex>
        <Flex justify={"space-between"}>
          <Text>{t("Dapp:content")}</Text>
          <Text maxW={"70%"}>{program}</Text>
        </Flex>
      </Flex>
    );
  }, [dappRequest, t]);

  const onConfirm = useCallback(() => {
    if (requestId && selectedAccount?.account.address) {
      void popupServerClient.onRequestFinish({
        requestId,
      });
    }
  }, [popupServerClient, requestId, selectedAccount?.account.address]);

  const onCancel = useCallback(() => {
    if (requestId) {
      void popupServerClient.onRequestFinish({
        requestId,
        error: ERROR_CODE.USER_CANCEL,
      });
    }
  }, []);

  return (
    <Content>
      <ResponsiveFlex
        alignSelf={"center"}
        align={"center"}
        flexDir={"column"}
        flex={1}
      >
        <Flex
          justify={"center"}
          align={"center"}
          mb={3}
          alignSelf={"flex-start"}
        >
          <IconLogo mr={2} />
          <IconFoxWallet />
        </Flex>
        {!!dappRequest?.siteInfo && (
          <DappInfo siteInfo={dappRequest.siteInfo} />
        )}
        <Text mt={3} mb={3}>
          {t("Dapp:requestDeployment")}
        </Text>
        <AccountInfo account={selectedAccount} />
        <Text mt={3} mb={3}>
          {t("Dapp:requestDetail")}
        </Text>
        {dappRequestInfo}
        <Flex
          mt={3}
          position={"fixed"}
          left={5}
          right={5}
          bottom={5}
          justify={"center"}
        >
          <ResponsiveFlex flexDir={"column"}>
            <Flex alignSelf={"stretch"}>
              <Button
                onClick={onCancel}
                flex={1}
                colorScheme="secondary"
                mr={2}
              >
                {t("Common:cancel")}
              </Button>
              <Button onClick={onConfirm} flex={1} ml={"2"}>
                {t("Common:confirm")}
              </Button>
            </Flex>
          </ResponsiveFlex>
        </Flex>
      </ResponsiveFlex>
    </Content>
  );
}

export default DeploymentScreen;
