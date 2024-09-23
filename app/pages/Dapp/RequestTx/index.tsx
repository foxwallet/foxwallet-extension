import { ERROR_CODE } from "@/common/types/error";
import { IconFoxWallet, IconLogo } from "@/components/Custom/Icon";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { AccountInfo } from "@/components/Dapp/AccountInfo";
import { DappInfo } from "@/components/Dapp/DappInfo";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useClient } from "@/hooks/useClient";
import { useCoinService } from "@/hooks/useCoinService";
import { useDappRequest } from "@/hooks/useDappRequest";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text } from "@chakra-ui/react";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

function RequestTxScreen() {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, [getMatchAccountsWithUniqueId]);
  const { requestId } = useParams();
  const { popupServerClient } = useClient();
  const { dappRequest, loading } = useDappRequest(requestId);
  const { t } = useTranslation();
  const { nativeCurrency } = useCoinService(InnerChainUniqueId.ALEO_MAINNET);

  const dappRequestInfo = useMemo(() => {
    if (!dappRequest) {
      return null;
    }
    const { payload } = dappRequest;
    const { chainId, programId, functionName, inputs, baseFee, priorityFee } =
      payload;
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
            {programId}-{functionName}
          </Text>
        </Flex>
        <Flex justify={"space-between"}>
          <Text>{t("Dapp:inputs")}</Text>
          <Text maxW={"70%"}>{inputs.join(",")}</Text>
        </Flex>
        <Flex justify={"space-between"}>
          <Text>{t("Dapp:gasFee")}</Text>
          <TokenNum
            amount={BigInt(baseFee) + BigInt(priorityFee)}
            decimals={nativeCurrency.decimals}
            symbol={nativeCurrency.symbol}
          />
        </Flex>
      </Flex>
    );
  }, [dappRequest, t, nativeCurrency]);

  const onConnect = useCallback(() => {
    if (requestId && selectedAccount?.account.address) {
      popupServerClient.onRequestFinish({
        requestId,
        data: selectedAccount.account.address,
      });
    }
  }, [popupServerClient, requestId, selectedAccount?.account.address]);

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
          {t("Dapp:requestTx")}
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
              <Button onClick={onConnect} flex={1} ml={"2"}>
                {t("Common:confirm")}
              </Button>
            </Flex>
          </ResponsiveFlex>
        </Flex>
      </ResponsiveFlex>
    </Content>
  );
}

export default RequestTxScreen;
