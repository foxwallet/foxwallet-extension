import { useParams } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import { useDappRequest } from "@/hooks/useDappRequest";
import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo } from "react";
import { ERROR_CODE } from "@/common/types/error";
import { Content } from "@/layouts/Content";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { Button, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import { IconFoxWallet, IconLogo } from "@/components/Custom/Icon";
import { DappInfo } from "@/components/Dapp/DappInfo";
import type { DappRequest } from "@/database/types/dapp";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { H5, H6 } from "@/common/theme/components/text";
import { useBalance } from "@/hooks/useBalance";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { ethers } from "ethers";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { store } from "@/store/store";
import { usePopupDispatch } from "@/hooks/useStore";
import { timeout } from "@/common/utils/timeout";

function RequestParsedPart({
  dappRequest,
  requestId,
  onCancel,
}: {
  dappRequest: DappRequest;
  requestId: string;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { popupServerClient } = useClient();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { coinType, payload, address } = dappRequest;
  const { params, uniqueId } = payload;
  const dispatch = usePopupDispatch();

  useEffect(() => {
    console.log("dappRequest", dappRequest);
  }, [dappRequest]);
  const {
    type,
    options: { address: contractAddress, decimals, image, symbol },
  } = params;

  const token = useMemo(
    () => ({
      type: AssetType.TOKEN,
      ownerAddress: address,
      uniqueId,
      symbol,
      decimals,
      contractAddress,
    }),
    [address, contractAddress, decimals, symbol, uniqueId],
  );
  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address,
    refreshInterval: 10000,
    token,
  });

  const onConfirm = useCallback(async () => {
    dispatch.tokens.selectToken({
      uniqueId,
      address,
      token: token as TokenV2,
    });
    await timeout(300);
    await popupServerClient.onRequestFinish({
      requestId,
      data: token,
    });
  }, [dispatch.tokens, uniqueId, address, token, popupServerClient, requestId]);

  return (
    <ResponsiveFlex
      alignSelf={"center"}
      align={"center"}
      flexDir={"column"}
      flex={1}
      maxH={490}
    >
      <Flex justify={"center"} align={"center"} mb={3} alignSelf={"flex-start"}>
        <IconLogo mr={2} />
        <IconFoxWallet />
      </Flex>
      <H5 mt={3} mb={3}>
        {"Add token"}
      </H5>

      {!!dappRequest?.siteInfo && <DappInfo siteInfo={dappRequest.siteInfo} />}
      <ResponsiveFlex flexDir={"column"}>
        <Flex mt={2} alignSelf={"stretch"} justifyContent={"space-between"}>
          <H6 mb={2}>Token</H6>
          <Flex alignItems={"center"}>
            <Image src={image} w={"24px"} h={"24px"} borderRadius={"50px"} />
            <H6 ml={2}>{symbol}</H6>
          </Flex>
        </Flex>
        <Flex mt={2} alignSelf={"stretch"} justifyContent={"space-between"}>
          <H6 mb={2}>{t("TokenDetail:balance")}</H6>
          {loadingBalance ? (
            <Spinner w={2} h={2} />
          ) : (
            <TokenNum
              amount={balance?.publicBalance ?? 0n}
              decimals={decimals}
              symbol={symbol}
            />
          )}
        </Flex>
      </ResponsiveFlex>
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
            <Button onClick={onCancel} flex={1} colorScheme="secondary" mr={2}>
              {t("Common:cancel")}
            </Button>
            <Button onClick={onConfirm} flex={1} ml={"2"}>
              {t("Common:confirm")}
            </Button>
          </Flex>
        </ResponsiveFlex>
      </Flex>
    </ResponsiveFlex>
  );
}

function AddTokenConfirmScreen() {
  const { requestId } = useParams();
  const { popupServerClient } = useClient();
  const { dappRequest, loading } = useDappRequest(requestId);

  const { t } = useTranslation();

  const onCancel = useCallback(() => {
    if (requestId) {
      void popupServerClient.onRequestFinish({
        requestId,
        error: ERROR_CODE.USER_CANCEL,
      });
    }
  }, [popupServerClient, requestId]);

  if (!!dappRequest && !!requestId) {
    return (
      <Content>
        <RequestParsedPart
          dappRequest={dappRequest}
          requestId={requestId}
          onCancel={onCancel}
        />
      </Content>
    );
  }
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
          {t("Dapp:addChain")}
        </Text>
        <Text mt={3} mb={3}>
          {t("Dapp:requestDetail")}
        </Text>
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
              <Button onClick={() => {}} flex={1} ml={"2"}>
                {t("Common:confirm")}
              </Button>
            </Flex>
          </ResponsiveFlex>
        </Flex>
      </ResponsiveFlex>
    </Content>
  );
}

export default AddTokenConfirmScreen;
