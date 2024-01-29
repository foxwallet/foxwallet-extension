import { ERROR_CODE } from "@/common/types/error";
import { IconFoxWallet, IconLogo } from "@/components/Custom/Icon";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { AccountInfo } from "@/components/Dapp/AccountInfo";
import { DappInfo } from "@/components/Dapp/DappInfo";
import { useClient } from "@/hooks/useClient";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useDappRequest } from "@/hooks/useDappRequest";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

function SignMessageScreen() {
  const { selectedAccount } = useCurrAccount();
  const { requestId } = useParams();
  const { popupServerClient } = useClient();
  const { dappRequest, loading } = useDappRequest(requestId);
  const { t } = useTranslation();

  const dappRequestInfo = useMemo(() => {
    if (!dappRequest) {
      return null;
    }
    const { payload } = dappRequest;
    const message = payload.message;
    return (
      <Flex
        direction={"column"}
        w={"full"}
        borderRadius={"lg"}
        borderStyle={"solid"}
        borderWidth={"1px"}
        borderColor={"gray.50"}
        flex={1}
        p={2}
        maxH={[200, 300, 400, 500]}
        overflowY={"auto"}
      >
        <Text>{t("Dapp:message")}:</Text>
        <Text maxW={"full"} fontWeight={"bold"} mt={2}>
          {message}
        </Text>
      </Flex>
    );
  }, [dappRequest, t]);

  const onConfirm = useCallback(() => {
    if (requestId && selectedAccount?.address) {
      popupServerClient.onRequestFinish({
        requestId,
      });
    }
  }, [popupServerClient, requestId, selectedAccount?.address]);

  const onCancel = useCallback(() => {
    if (requestId) {
      popupServerClient.onRequestFinish({
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
          {t("Dapp:requestSignMessage")}
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

export default SignMessageScreen;
