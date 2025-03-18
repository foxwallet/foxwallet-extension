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

export type Step2Data = {
  amountStr?: string;
  currGasFee?: GasFee<CoinType>;
  recommendGasFee?: GasFee<CoinType>;
};

interface SendDataStepProps {
  fromAddress: string;
  toAddress: string;
  uniqueId: ChainUniqueId;
  // initData 页面加载时需要填充的数据, 包括转账金额amountStr和gasFee, 这里的gasGee可能为自定义的数据
  initData: Step2Data;
  onStep3: (data: Step2Data) => void;
  onSend: (
    gasFee: GasFee<CoinType> | undefined,
    value: bigint | undefined,
  ) => void;
  token?: TokenV2;
}

export const SendDataStep = (props: SendDataStepProps) => {
  const { uniqueId, toAddress, onSend, token, fromAddress, onStep3, initData } =
    props;
  const { t } = useTranslation();
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);
  const { supportCustomGasFee } = useChainConfig(uniqueId);

  console.log("      initData ", initData);

  const [amountStr, setAmountStr] = useState(initData?.amountStr ?? "");
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
        if (amountBigint < 0n) {
          return {
            amountValid: false,
            amountBigint: undefined,
            amountValidErrMsg: t("Send:invalidAmount"),
          };
        }
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
  // console.log(
  //   "      amountBigint",
  //   amountValid,
  //   amountBigint,
  //   amountValidErrMsg,
  // );

  // gas fee 相关

  // gas fee sample
  // estimateGas: 241382509200000n
  // gasLimit: 21000
  // maxFeePerGas: 11494405200n
  // maxPriorityFeePerGas: 1097240700n
  // type: 1

  // 在发送交易时真正被使用的Gas参数
  // const [gasFee, setGasFee] = useState<GasFee<CoinType> | undefined>();

  // 默认Gas，也可以理解为系统推荐的Gas，用户修改自定义Gas后可以恢复到默认Gas。
  // const [defaultGasFeeData, setDefaultGasFeeData] = useState<
  //   GasFee<CoinType> | undefined
  // >();

  // 用户手动修改的自定义Gas
  // customGasFeeOption for estimate param only, customGasFeeOption.estimateGas should not be used
  // 当自定义Gas发生变化后 会触发 reEstimate，更新 gasFeeData
  // const [customGasFeeOption, setCustomGasFeeOption] = useState<
  //   GasFee<CoinType> | undefined
  // >();

  // 默认Gas，也可以理解为系统推荐的Gas
  const {
    gasFee: defaultGasFeeData,
    loadingGasFee,
    error: loadingGasFeeError,
  } = useGasFee<typeof coinType>({
    uniqueId,
    from: fromAddress,
    to: toAddress,
    value: amountBigint,
    token,
    refreshInterval: 1 * 60 * 1000,
  });
  console.log("      defaultGasFeeData", defaultGasFeeData);

  // 在发送交易时真正被使用的Gas参数
  const gasFee = useMemo(() => {
    return initData?.currGasFee ?? defaultGasFeeData;
  }, [initData.currGasFee, defaultGasFeeData]);

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

  // e.g.  21.4357382734 Gwei
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
  // console.log("      gasFeeStr", gasFeeStr);

  // e.g.  0.00043423 ETH
  const gasAmountStr = useMemo(() => {
    return formatGasStr(
      gasSymbol,
      BigNumber.from(gasValue.toString()),
      gasDecimals,
    );
  }, [gasDecimals, gasSymbol, gasValue]);

  const { balance: coinBalance } = useBalance({
    uniqueId,
    address: fromAddress,
  });

  const enoughGas = useMemo(() => {
    return coinBalance ? coinBalance.total >= gasValue : false;
  }, [coinBalance, gasValue]);

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

  const onGasSetting = useCallback(() => {
    if (supportCustomGasFee && amountStr && gasFee) {
      onStep3({ amountStr, currGasFee: gasFee });
    }
  }, [amountStr, gasFee, onStep3, supportCustomGasFee]);

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
        {!enoughGas && (
          <Text color={"#EF466F"} fontWeight={500} fontSize={"small"}>
            {t("Error:insufficientGas")}
          </Text>
        )}
      </>
    );
  }, [
    t,
    loadingGasFee,
    onGasSetting,
    gasFee,
    gasFeeStr,
    supportCustomGasFee,
    gasAmountStr,
    enoughGas,
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
            !gasFee ||
            !enoughGas
          }
        >
          {t("Common:confirm")}
        </Button>
      </Content>
    </Box>
  );
};
