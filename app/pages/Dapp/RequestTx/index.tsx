import { ERROR_CODE } from "@/common/types/error";
import {
  IconChevronRight,
  IconCopyBlack,
  IconFoxWallet,
  IconLogo,
} from "@/components/Custom/Icon";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { AccountInfo } from "@/components/Dapp/AccountInfo";
import { DappInfo } from "@/components/Dapp/DappInfo";
import { useClient } from "@/hooks/useClient";
import { useCoinService } from "@/hooks/useCoinService";
import { useDappRequest } from "@/hooks/useDappRequest";
import { useChainConfig, useGroupAccount } from "@/hooks/useGroupAccount";
import { Content } from "@/layouts/Content";
import { Button, Flex, Image, Text, useClipboard } from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { type DappRequest } from "@/database/types/dapp";
import { useGasFee } from "@/hooks/useGasFee";
import { H6 } from "@/common/theme/components/text";
import { LoadingOverlay, LoadingView } from "@/components/Custom/Loading";
import { formatGasStr } from "core/utils/num";
import { BigNumber, utils } from "ethers";
import { GasFeeType } from "core/types/GasFee";
import { type CustomGasSettingData, GasSettingStep } from "./GasSettingStep";
import { PageWithHeader } from "@/layouts/Page";
import { JSONStringifyWithBigInt } from "@/common/utils/json";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { useBalance } from "@/hooks/useBalance";
import disable = chrome.action.disable;
import { isNotEmpty } from "core/utils/is";
import { WarningArea } from "@/components/Custom/WarningArea";

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
  const { uniqueId, from, to, value, data } = payload;
  const { nativeCurrency, coinService } = useCoinService(uniqueId);
  const { supportCustomGasFee } = useChainConfig(uniqueId);
  const [showGasSetting, setShowGasSetting] = useState(false);
  const [sendingTx, setSendingTx] = useState(false);
  const [checking, setChecking] = useState(false);
  const [customGasSettingData, setCustomGasSettingData] =
    useState<CustomGasSettingData>({});
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);
  const {
    gasFee: defaultGasFeeData,
    loadingGasFee,
    error: loadingGasFeeError,
  } = useGasFee<typeof coinType>({
    uniqueId,
    from,
    to,
    value,
    data,
    refreshInterval: 1 * 60 * 1000,
  });

  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address: from,
    refreshInterval: 10000,
  });

  const { chainConfig } = useChainConfig(uniqueId);

  const gasFee = useMemo(() => {
    return customGasSettingData.isCustom
      ? customGasSettingData.gasFee
      : defaultGasFeeData;
  }, [
    customGasSettingData.gasFee,
    customGasSettingData.isCustom,
    defaultGasFeeData,
  ]);

  const onGasSetting = useCallback(() => {
    if (!gasFee) {
      return;
    }
    setShowGasSetting(true);
  }, [gasFee]);

  const gasValue = useMemo(() => {
    if (!gasFee) {
      return 0n;
    }
    switch (gasFee.type) {
      case GasFeeType.EIP1559:
        return gasFee.maxFeePerGas * BigInt(gasFee.gasLimit);
      case GasFeeType.LEGACY:
        return gasFee.gasPrice * BigInt(gasFee.gasLimit);
      case GasFeeType.UTXO:
        return gasFee.estimateGas;
      default:
        return 0n;
    }
  }, [gasFee]);

  const { disabled, insufficient } = useMemo(() => {
    if (loadingBalance && !isNotEmpty(balance)) {
      return { disabled: true };
    }
    if (gasFee?.estimateGas) {
      const insufficient = (balance?.total ?? 0n) < gasFee.estimateGas + value;
      return { disabled: insufficient, insufficient };
    }
    return { disabled: true };
  }, [balance, gasFee?.estimateGas, loadingBalance, value]);

  const gasAmountStr = useMemo(() => {
    return formatGasStr(
      nativeCurrency.symbol,
      BigNumber.from(gasValue.toString()),
      nativeCurrency.decimals,
    );
  }, [nativeCurrency, gasValue]);

  const gasUnit = useMemo(() => {
    return coinService.gasUnit();
  }, [coinService]);

  const gasFeeStr = useMemo(() => {
    const data = gasFee;
    if (!data || !supportCustomGasFee) {
      return "";
    }
    let displayStr = "";
    switch (data.type) {
      case GasFeeType.EIP1559:
        displayStr = utils.formatUnits(data.maxFeePerGas, "gwei");
        break;
      case GasFeeType.LEGACY:
        displayStr = utils.formatUnits(data.gasPrice, "gwei");
        break;
      // case GasFeeType.UTXO:
      //   networkFee = data.feeRate ? `${data.feeRate}` : "--";
      //   break;
      default:
        break;
    }
    if (!displayStr) {
      return "";
    }
    return `${displayStr} ${gasUnit}`;
  }, [gasFee, gasUnit, supportCustomGasFee]);
  const onConnect = useCallback(async () => {
    if (sendingTx) {
      return;
    }
    if (requestId && gasFee) {
      console.log("sendingTx", performance.now());
      setSendingTx(true);
      try {
        await popupServerClient.onRequestFinish({
          requestId,
          data: JSONStringifyWithBigInt(gasFee),
        });
      } finally {
        console.log("sendingTx", sendingTx);
        setSendingTx(false);
      }
    }
  }, [sendingTx, requestId, gasFee, popupServerClient]);

  const { onCopy } = useClipboard(data);
  const { showToast } = useCopyToast();

  const handleCopy = useCallback(() => {
    onCopy();
    showToast();
  }, [onCopy, showToast]);

  if (showGasSetting) {
    return (
      <PageWithHeader
        title={`Edit Gas fee`}
        onBack={() => {
          setShowGasSetting(false);
          return true;
        }}
      >
        <GasSettingStep
          uniqueId={uniqueId}
          onConfirm={(data: CustomGasSettingData) => {
            console.log("step3Data", data);
            setCustomGasSettingData(data);
            setShowGasSetting(false);
          }}
          customGasSettingData={{
            ...customGasSettingData,
            gasFee: customGasSettingData.isCustom
              ? customGasSettingData.gasFee
              : defaultGasFeeData,
          }}
        />
      </PageWithHeader>
    );
  }

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
      {!!dappRequest?.siteInfo && <DappInfo siteInfo={dappRequest.siteInfo} />}
      <Text mt={3} mb={3}>
        {t("Dapp:requestTx")}
      </Text>
      <AccountInfo account={selectedAccount} />
      <Flex direction={"column"} overflowY={"auto"} flex={1}>
        <Text mt={3} mb={3}>
          {t("Dapp:requestDetail")}
        </Text>
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
            {/* <Image src={chainConfig.logo} w={"24px"} h={"24px"} borderRadius={"50px"} /> */}
            <Text>{chainConfig.chainName}</Text>
          </Flex>
          {!!to && (
            <Flex justify={"space-between"}>
              <Text>{t("Send:to")}</Text>
              <Text maxW={"70%"} wordBreak={"break-all"}>
                {to}
              </Text>
            </Flex>
          )}
          <Flex justify={"space-between"}>
            <Text>{t("Send:value")}</Text>
            <TokenNum
              amount={value}
              decimals={nativeCurrency.decimals}
              symbol={nativeCurrency.symbol}
            />
          </Flex>
          {!!data && (
            <>
              <Flex justify={"space-between"} onClick={handleCopy}>
                <Text>{"Data"}</Text>
                <IconCopyBlack h={3.5} w={3.5} />
              </Flex>
              <Flex
                direction={"column"}
                alignSelf={"stretch"}
                borderRadius={"lg"}
                borderStyle={"solid"}
                borderWidth={"1px"}
                borderColor={"gray.50"}
                flex={1}
                h={200}
                overflowY={"auto"}
                p={2}
                backgroundColor={"gray.50"}
              >
                <Text wordBreak={"break-all"}>{data}</Text>
              </Flex>
            </>
          )}
        </Flex>
        <Flex direction={"column"} alignSelf={"stretch"} mt={4}>
          <H6 mb={"2"}>{t("Send:gasFee")}</H6>
          <Flex
            h={"44px"}
            borderColor={"gray.50"}
            borderRadius={"8px"}
            borderWidth={"1.5px"}
            onClick={() => {}}
            direction={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            position={"relative"}
            paddingX={"10px"}
            mb={"10px"}
          >
            {loadingGasFee ? (
              <LoadingView />
            ) : (
              <Flex
                cursor={"pointer"}
                w={"full"}
                alignItems={"center"}
                h={"full"}
                justifyContent={loadingGasFee ? "center" : "space-between"}
                onClick={onGasSetting}
              >
                <Text>{gasAmountStr}</Text>
                {gasFee && (
                  <Flex justifyContent={"center"} alignItems={"center"}>
                    <Text>{gasFeeStr}</Text>
                    {supportCustomGasFee && (
                      <IconChevronRight w={4} h={4} ml={"1px"} />
                    )}
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>
        {insufficient && (
          <WarningArea
            container={{ mt: 4 }}
            content={t("Send:insufficientBalance")}
          />
        )}
      </Flex>
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
            <Button
              isLoading={checking}
              isDisabled={disabled}
              onClick={onConnect}
              flex={1}
              ml={"2"}
            >
              {t("Common:confirm")}
            </Button>
          </Flex>
        </ResponsiveFlex>
      </Flex>
    </ResponsiveFlex>
  );
}

function RequestTxScreen() {
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
          {t("Dapp:requestTx")}
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

export default RequestTxScreen;
