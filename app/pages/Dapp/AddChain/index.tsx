import { useParams } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import { useDappRequest } from "@/hooks/useDappRequest";
import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import { ERROR_CODE } from "@/common/types/error";
import { Content } from "@/layouts/Content";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { Button, Flex, Text } from "@chakra-ui/react";
import { IconFoxWallet, IconLogo } from "@/components/Custom/Icon";
import { DappInfo } from "@/components/Dapp/DappInfo";
import type { DappRequest } from "@/database/types/dapp";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { BaseInput } from "@/components/Custom/Input";
import { H6 } from "@/common/theme/components/text";
import { parseEthChainId } from "core/coins/ETH/utils";
import validUrl from "valid-url";
import { usePopupDispatch } from "@/hooks/useStore";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";
import { formatCustomEthRpcUniqueId } from "core/helper/ChainUniqueId";
import { CoinType } from "core/types";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
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
  const { coinType, payload } = dappRequest;
  const { params } = payload;
  const {
    chainId,
    chainName,
    nativeCurrency,
    rpcUrls: oriRpcUrls,
    blockExplorerUrls,
  } = params[0];
  const dispatch = usePopupDispatch();

  const [rpcUrls, setRpcUrls] = useState(
    (oriRpcUrls as string[]).filter((it) => validUrl.isHttpsUri(it)),
  );

  const onConfirm = useCallback(async () => {
    const confirm = { ...params[0], rpcUrls };
    const firstValidBlockExplorerUrl =
      confirm.blockExplorerUrls && Array.isArray(confirm.blockExplorerUrls)
        ? confirm.blockExplorerUrls.find((blockExplorerUrl: string) =>
            validUrl.isHttpsUri(blockExplorerUrl),
          )
        : null;

    const chainIdRes = parseEthChainId(confirm.chainId);
    const uniqueId = formatCustomEthRpcUniqueId(chainIdRes.chainId);
    const validRPCUrls =
      confirm.rpcUrls && Array.isArray(confirm.rpcUrls)
        ? confirm.rpcUrls.filter((rpcUrl: string) =>
            validUrl.isHttpsUri(rpcUrl),
          )
        : null;
    const newChainConfig: ETHConfig = {
      coinType: CoinType.ETH,
      uniqueId,
      chainId: chainIdRes.chainId.toString(),
      chainName: confirm.chainName,
      rpcList: validRPCUrls,
      nativeCurrency: confirm.nativeCurrency || {
        name: "Eth",
        decimals: 18,
        symbol: "ETH",
      },
      explorerUrls: {
        [ExplorerLanguages.EN]: firstValidBlockExplorerUrl || "",
        [ExplorerLanguages.ZH]: firstValidBlockExplorerUrl || "",
      },
    };

    dispatch.multiChain.addChainConfig({
      chainConfig: newChainConfig,
    });
    await timeout(300);
    await popupServerClient.onRequestFinish({
      requestId,
      data: confirm,
    });
  }, [params, rpcUrls, dispatch.multiChain, popupServerClient, requestId]);

  return (
    <ResponsiveFlex
      alignSelf={"center"}
      align={"center"}
      flexDir={"column"}
      flex={1}
      overflowY={"auto"}
      maxHeight={"calc(100vh - 120px)"}
      px={5}
    >
      <Flex justify={"center"} align={"center"} mb={3} alignSelf={"flex-start"}>
        <IconLogo mr={2} />
        <IconFoxWallet />
      </Flex>
      <Text mt={3} mb={3}>
        {t("Dapp:addChain", { CHAIN: chainName })}
      </Text>

      {!!dappRequest?.siteInfo && <DappInfo siteInfo={dappRequest.siteInfo} />}
      <ResponsiveFlex flexDir={"column"}>
        <BaseInput
          title={t("Networks:networkName")}
          container={{ mt: "2" }}
          value={chainName}
          isDisabled={true}
        />
        <BaseInput
          title={t("Networks:symbol")}
          container={{ mt: "2" }}
          value={nativeCurrency.symbol}
          isDisabled={true}
        />
        {/* <BaseInput */}
        {/*  title={t("Networks:rpc")} */}
        {/*  placeholder={t("Networks:rpcHint")} */}
        {/*  container={{ mt: "2" }} */}
        {/*  value={""} */}
        {/*  // onChange={onRpcUrlChange} */}
        {/*  // isInvalid={true} */}
        {/* /> */}
        <H6 mb={"2"} mt={2}>
          {t("Networks:rpc")}
        </H6>
        {rpcUrls.map((rpcUrl: string) => (
          <Text key={rpcUrl}>{rpcUrl}</Text>
        ))}
        <Flex mt={2} alignSelf={"stretch"} justifyContent={"space-between"}>
          <H6 mb={"2"}>{t("Networks:chainId")}</H6>
          <Text>{parseEthChainId(chainId).chainId}</Text>
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

function AddChainScreen() {
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
      <Content px={0}>
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

export default AddChainScreen;
