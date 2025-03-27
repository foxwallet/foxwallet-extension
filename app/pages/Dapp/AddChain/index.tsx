import { useParams } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import { useDappRequest } from "@/hooks/useDappRequest";
import { useTranslation } from "react-i18next";
import type React from "react";
import { useCallback, useMemo } from "react";
import { ERROR_CODE } from "@/common/types/error";
import { Content } from "@/layouts/Content";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { Button, Flex } from "@chakra-ui/react";
import { IconFoxWallet, IconLogo } from "@/components/Custom/Icon";
import { DappInfo } from "@/components/Dapp/DappInfo";
import type { DappRequest } from "@/database/types/dapp";
import { H6 } from "@/common/theme/components/text";
import { parseEthChainId } from "core/coins/ETH/utils";
import validUrl from "valid-url";
import { usePopupDispatch } from "@/hooks/useStore";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";
import { formatCustomEthRpcUniqueId } from "core/helper/ChainUniqueId";
import { CoinType } from "core/types";
import { timeout } from "@/common/utils/timeout";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import RPCConfigTemplate from "@/pages/Dapp/AddChain/RPCConfigTemplate";
import { SupportLanguages } from "@/locales/i18";
import { showErrorToast } from "@/components/Custom/ErrorToast";

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
  const dispatch = usePopupDispatch();
  const { popupServerClient } = useClient();
  const { payload } = dappRequest;

  const { params } = payload;

  const defaultConf = useMemo(() => {
    if (!params[0]) {
      return undefined;
    }
    const payload = params[0];
    const chainIdRes = parseEthChainId(payload.chainId);
    const uniqueId = formatCustomEthRpcUniqueId(chainIdRes.chainId);

    const validRPCUrls =
      payload.rpcUrls && Array.isArray(payload.rpcUrls)
        ? payload.rpcUrls.filter((rpcUrl: string) =>
            validUrl.isHttpsUri(rpcUrl),
          )
        : [];
    const firstValidBlockExplorerUrl =
      payload.blockExplorerUrls && Array.isArray(payload.blockExplorerUrls)
        ? payload.blockExplorerUrls.find((blockExplorerUrl: string) =>
            validUrl.isHttpsUri(blockExplorerUrl),
          )
        : null;
    return {
      coinType: CoinType.ETH,
      uniqueId,
      chainId: chainIdRes.chainId.toString(),
      chainName: payload.chainName,
      rpcList: validRPCUrls,
      nativeCurrency: payload.nativeCurrency || {
        name: "Eth",
        decimals: 18,
        symbol: "ETH",
      },
      explorerUrls: {
        [SupportLanguages.EN]: firstValidBlockExplorerUrl || "",
        [SupportLanguages.ZH]: firstValidBlockExplorerUrl || "",
      },
    } as ETHConfig;
  }, [params]);

  const submitNew = useCallback(
    async (newChainConfig: ChainBaseConfig) => {
      if (newChainConfig.rpcList?.length === 0) {
        void showErrorToast({ message: t("Networks:invalidRpc") });
        return;
      }
      dispatch.multiChain.addChainConfig({
        chainConfig: newChainConfig,
      });
      await timeout(300);
      await popupServerClient.onRequestFinish({
        requestId,
        data: confirm,
      });
    },
    [dispatch.multiChain, popupServerClient, requestId, t],
  );

  return (
    <RPCConfigTemplate
      defaultConf={defaultConf}
      browserAdd={true}
      siteInfo={dappRequest?.siteInfo}
      submitNew={submitNew}
      onCancel={onCancel}
    />
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
        <H6 mt={3} mb={3}>
          {t("Dapp:addChain")}
        </H6>
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
