import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useDebounce } from "use-debounce";
import { IconChevronRight } from "@/components/Custom/Icon";
import { LoadingView } from "@/components/Custom/Loading";
import { useBalance } from "@/hooks/useBalance";
import { useGasFee } from "@/hooks/useGasFee";
import { BigNumber, ethers, utils } from "ethers";
import { type GasFee, GasFeeType } from "core/types/GasFee";
import { type CoinType } from "core/types";
import { type TokenV2 } from "core/types/Token";
import { useCoinService } from "@/hooks/useCoinService";
import { useChainConfig } from "@/hooks/useGroupAccount";
import { formatGasStr } from "core/utils/num";
import { useNavigate } from "react-router-dom";

interface SendDataStepProps {
  fromAddress: string;
  toAddress: string;
  uniqueId: ChainUniqueId;
  onStep3: () => void;
  onSend: (
    gasFee: GasFee<CoinType> | undefined,
    value: bigint | undefined,
  ) => void;
  token?: TokenV2;
}

export const SendDataStep = (props: SendDataStepProps) => {
  const { uniqueId, toAddress, onSend, token, fromAddress, onStep3 } = props;
  const { t } = useTranslation();
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);
  const { supportCustomGasFee } = useChainConfig(uniqueId);

  const [amountStr, setAmountStr] = useState("");
  const [debounceAmountStr] = useDebounce(amountStr.trim(), 500);

  const onAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setAmountStr(value);
    },
    [setAmountStr],
  );

  const { symbol, decimals, coinType, gasSymbol, gasDecimals } = useMemo(() => {
    return {
      symbol: token?.symbol ?? nativeCurrency.symbol,
      decimals: token?.decimals ?? nativeCurrency.decimals,
      coinType: chainConfig.coinType,
      gasSymbol: nativeCurrency.symbol,
      gasDecimals: nativeCurrency.decimals,
    };
  }, [chainConfig, nativeCurrency, token]);

  const { balance, loadingBalance } = useBalance({
    address: fromAddress,
    uniqueId,
    token,
  });

  const balanceStr = useMemo(() => {
    if (balance) {
      try {
        return ethers.utils.formatUnits(balance.total, decimals);
      } catch (err) {
        return "";
      }
    }
    return "";
  }, [balance, decimals]);

  // 输入字符检查
  const { amountValid, amountBigint, amountValidErrMsg } = useMemo(() => {
    if (debounceAmountStr) {
      try {
        const res = ethers.utils.parseUnits(debounceAmountStr, decimals);
        const amountBigint = res.toBigInt();
        if (balance && amountBigint > balance.total) {
          return {
            amountValid: false,
            amountBigint,
            amountValidErrMsg: t("Send:insufficientBalance"),
          };
        }
        return { amountValid: true, amountBigint, amountValidErrMsg: "" };
      } catch {
        return {
          amountValid: false,
          amountBigint: undefined,
          amountValidErrMsg: t("Send:invalidAmount"),
        };
      }
    }
    return {
      amountValid: false,
      amountBigint: undefined,
      amountValidErrMsg: "",
    };
  }, [debounceAmountStr, decimals, balance, t]);
  console.log(
    "      amountBigint",
    amountValid,
    amountBigint,
    amountValidErrMsg,
  );

  // gas fee sample
  // estimateGas: 241382509200000n
  // gasLimit: 21000
  // maxFeePerGas: 11494405200n
  // maxPriorityFeePerGas: 1097240700n
  // type: 1
  const {
    gasFee,
    loadingGasFee,
    error: loadGasFeeError,
  } = useGasFee<typeof coinType>(
    uniqueId,
    fromAddress,
    toAddress,
    amountBigint,
    token,
  );
  console.log("      gasFee", gasFee);

  const gasValue = useMemo(() => {
    if (!gasFee) {
      return 0n;
    }
    switch (gasFee.type) {
      case GasFeeType.EIP1559:
        return gasFee.maxFeePerGas * BigInt(gasFee.gasLimit);
      case GasFeeType.LEGACY:
        return gasFee.gasPrice * BigInt(gasFee.gasLimit);
      default:
        return 0n;
    }
  }, [gasFee]);

  // const [valueMode, setValueMode] = useState(false);

  // 转token数量or转法币数量
  // const [amountType, setAmountType] = useState<AmountType>(AmountType.TOKEN);
  // const amountTypeRef = useDataRef(amountType);

  // max mode
  // const [maxMode, setMaxMode] = useState<boolean>(false);
  // const maxModeRef = useDataRef(maxMode);
  // const [loadingMaxMode, setLoadingMaxMode] = useState<boolean>(false);
  // const { supportSendMaxNative } = useChainConfig(uniqueId);

  // const showMax = useMemo(() => {
  //   // 只对转账 token 放开 max mode
  //   if (amountType === AmountType.FIAT) {
  //     return false;
  //   }
  //   const supportMax =
  //     (assetType === AssetType.COIN && supportSendMaxNative) ||
  //     assetType === AssetType.TOKEN;
  //   if (!supportMax) {
  //     return false;
  //   }
  //   return !!toAddress;
  // }, [amountType, assetType, supportSendMaxNative, toAddress]);

  // 本位币价格
  // const { price: nativeCoinPrice } = useTokenPrice(uniqueId);
  // // 当前币价格
  // const { price: assetPrice } = useTokenPrice(uniqueId, asset?.contractAddress);
  // // 法币相对美元汇率
  // const { fiatCurrency, fiatRate } = useExchangeRate();

  const amountUnit = useMemo(() => {
    if (amountStr) {
      return <Text ml={1}>{symbol}</Text>;
    } else {
      return (
        <Flex>
          <Text textColor={"gray.500"}>0</Text>
          <Text ml={1}>{symbol}</Text>
        </Flex>
      );
    }
  }, [symbol, amountStr]);

  const gasUnit = useMemo(() => {
    return coinService.gasUnit();
  }, [coinService]);

  const networkFeeStr = useMemo(() => {
    const data = gasFee;
    if (!data || !supportCustomGasFee) {
      return "";
    }
    let networkFee = "";
    switch (data.type) {
      case GasFeeType.EIP1559:
        networkFee = utils.formatUnits(data.maxFeePerGas, "gwei");
        break;
      case GasFeeType.LEGACY:
        networkFee = utils.formatUnits(data.gasPrice, "gwei");
        break;
      // case GasFeeType.UTXO:
      //   networkFee = data.feeRate ? `${data.feeRate}` : "--";
      //   break;
      default:
        break;
    }
    if (!networkFee) {
      return "";
    }
    return `${networkFee} ${gasUnit}`;
  }, [gasFee, gasUnit, supportCustomGasFee]);

  console.log("      networkFeeStr");
  console.log(networkFeeStr);

  // const fiatStr = useMemo(() => {
  //   if (!amountStr) {
  //     return "≈ 0.00 USD";
  //   } else {
  //   }
  // }, [amountStr]);

  // 切换法币/token
  // 非 maxMode、非测试网下以及价格合理的，才显示切换按钮
  // const showSwitchBtn = useMemo(() => {
  // const temp = !maxMode && !chainConfig.testnet && (assetPrice ?? 0) >= 0.0000001;
  // return false;
  // }, []);

  const valueRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    valueRef.current?.focus();
  }, [valueRef]);

  const onNext = useCallback(() => {
    onSend(gasFee, amountBigint);
  }, [amountBigint, gasFee, onSend]);

  const onGasSetting = useCallback(() => {}, []);

  const BalanceView = useMemo(() => {
    return (
      <Flex mb={"20px"}>
        {loadingBalance ? (
          <LoadingView />
        ) : (
          <Text fontSize={"small"} color={"gray.500"}>
            {`${t("Send:available")}: ${balanceStr} ${symbol}`}
          </Text>
        )}
      </Flex>
    );
  }, [symbol, balanceStr, loadingBalance, t]);

  const ValueView = useMemo(() => {
    return (
      <>
        <H6 mb={"2"}>{t("Send:value")}</H6>
        <Flex
          h={"120px"}
          borderColor={"gray.50"}
          borderRadius={"8px"}
          borderWidth={"1.5px"}
          onClick={() => {
            valueRef.current?.focus();
          }}
          direction={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          position={"relative"}
          paddingX={"28px"}
          mb={"5px"}
        >
          <Flex
            w={"full"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"30px"}
          >
            <Input
              ref={valueRef}
              size={"sm"}
              _focus={{ borderColor: "white" }}
              borderColor={"white"}
              width={`${amountStr.length + 1}ch`}
              value={amountStr}
              textAlign={"right"}
              onChange={onAmountChange}
            ></Input>
            {amountUnit}
            {/* {showSwitchBtn && ( */}
            {/*  <IconButton */}
            {/*    w={5} */}
            {/*    h={5} */}
            {/*    position={"absolute"} */}
            {/*    right={"5px"} */}
            {/*    icon={<IconSwitch />} */}
            {/*    aria-label={"token fiat switch"} */}
            {/*    onClick={() => {}} */}
            {/*    bg={"transparent"} */}
            {/*  ></IconButton> */}
            {/* )} */}
          </Flex>
          {/* <Text position={"absolute"} mt={"60px"}> */}
          {/*  {fiatStr} */}
          {/* </Text> */}
          {amountValidErrMsg && (
            <Text
              position={"absolute"}
              mt={"90px"}
              color={"#EF466F"}
              fontWeight={500}
              fontSize={14}
            >
              {amountValidErrMsg}
            </Text>
          )}
        </Flex>
        {BalanceView}
      </>
    );
  }, [
    BalanceView,
    amountStr,
    amountUnit,
    amountValidErrMsg,
    onAmountChange,
    t,
  ]);

  const GasFeeView = useMemo(() => {
    return (
      <>
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
              h={"30px"}
              justifyContent={loadingGasFee ? "center" : "space-between"}
              onClick={() => {
                onStep3();
              }}
            >
              <Text>
                {formatGasStr(
                  gasSymbol,
                  BigNumber.from(gasValue.toString()),
                  gasDecimals,
                )}
              </Text>
              {gasFee && (
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Text>{networkFeeStr}</Text>
                  <IconChevronRight w={4} h={4} ml={"1px"} />
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      </>
    );
  }, [
    t,
    loadingGasFee,
    gasSymbol,
    gasValue,
    gasDecimals,
    gasFee,
    networkFeeStr,
    onGasSetting,
  ]);

  return (
    <Box overflowY={"auto"} h={"540px"}>
      <Content>
        {/* Value */}
        {ValueView}
        {/* Gas Fee */}
        {GasFeeView}
        {/* Confirm */}
        <Button
          w={"full"}
          mt={"40px"}
          onClick={onNext}
          isDisabled={
            !amountValid ||
            !amountStr ||
            loadingGasFee ||
            loadingGasFee ||
            !gasFee
          }
        >
          {t("Common:confirm")}
        </Button>
      </Content>
    </Box>
  );
};
