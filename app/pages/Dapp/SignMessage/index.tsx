import { ERROR_CODE } from "@/common/types/error";
import { hexToString } from "@/common/utils/hex";
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
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { CoinType } from "core/types";
import { getDefaultChainUniqueId } from "core/constants/chain";

function SignMessageScreen() {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { requestId } = useParams();
  const { popupServerClient } = useClient();
  const { dappRequest, loading } = useDappRequest(requestId);
  const coinType = useMemo(
    () => dappRequest?.coinType ?? CoinType.ETH,
    [dappRequest],
  );

  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(
      getDefaultChainUniqueId(coinType, {}),
    )[0];
  }, [coinType, getMatchAccountsWithUniqueId]);

  const { t } = useTranslation();

  const renderTypedMessageV1 = useCallback((msg: any) => {
    return (
      <Flex flexDir={"column"}>
        {msg.map((obj: any, i: number) => (
          <Flex justifyContent={"space-between"} key={`${obj.name}_${i}`}>
            <Text fontWeight={"bold"}>{obj.name}</Text>
            <Text key={obj.name}>{obj.value}</Text>
          </Flex>
        ))}
      </Flex>
    );
  }, []);
  const renderTypedMessageV3 = useCallback((obj: any, root = false) => {
    return Object.keys(obj).map((key) => (
      <Flex flexDir={"column"} key={key} ml={root ? 0 : 2}>
        {obj[key] && typeof obj[key] === "object" ? (
          <>
            <Text fontWeight={"bold"} mt={2}>
              {key}:
            </Text>
            {renderTypedMessageV3(obj[key])}
          </>
        ) : (
          <Flex>
            <Text fontWeight={"bold"}>{key + ": "}</Text>
            <Text>{`${obj[key]}`}</Text>
          </Flex>
        )}
      </Flex>
    ));
  }, []);

  const dappRequestInfo = useMemo(() => {
    if (!dappRequest) {
      return null;
    }
    const { payload } = dappRequest;
    const { message, method } = payload;
    const renderTypeDataV1 = [
      "eth_signTypedData",
      "eth_signTypedData_v1",
    ].includes(method);
    const renderTypeDataV3 = [
      "eth_signTypedData_v4",
      "eth_signTypedData_v3",
    ].includes(method);
    return (
      <Flex
        direction={"column"}
        alignSelf={"stretch"}
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
        {typeof message === "string" ? (
          <Text maxW={"full"} fontWeight={"bold"} mt={2}>
            {hexToString(message)}
          </Text>
        ) : renderTypeDataV3 ? (
          <>
            <Text fontWeight={"bold"} mt={2} mb={2}>
              primary type:{message.primaryType}
            </Text>
            {renderTypedMessageV3(message.message, true)}
          </>
        ) : (
          renderTypedMessageV1(message)
        )}
      </Flex>
    );
  }, [dappRequest, renderTypedMessageV1, renderTypedMessageV3, t]);

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
  }, [popupServerClient, requestId]);

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
