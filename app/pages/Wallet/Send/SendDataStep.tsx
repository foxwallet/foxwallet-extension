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
import { ethers } from "ethers";
import { GasFeeType } from "core/types/GasFee";

interface SendDataStepProps {
  toAddress: string;
  uniqueId: ChainUniqueId;
  onSend: () => void;
}

export const SendDataStep = (props: SendDataStepProps) => {
  const { uniqueId, toAddress, onSend } = props;
  const fromAddress = "0x180325d018A5ED8144e78eEfdc9Ea893E8BEd50E"; // for test
  const { t } = useTranslation();
  // const navigate = useNavigate();

  const [amountStr, setAmountStr] = useState("");
  const [debounceAmountStr] = useDebounce(amountStr.trim(), 500);

  const {
    balance,
    loadingBalance,
    error: loadBalanceError,
  } = useBalance(uniqueId, fromAddress);

  const balanceStr = useMemo(() => {
    if (balance) {
      return ethers.utils.formatUnits(balance, "ether");
    }
    return "";
  }, [balance]);

  // 输入字符检查
  const { amountValid, amountBigint, amountValidErrMsg } = useMemo(() => {
    if (debounceAmountStr) {
      try {
        const res = ethers.utils.parseEther(debounceAmountStr);
        const amountBigint = res.toBigInt();
        console.log("     amountBigint " + amountBigint);
        if (balance && amountBigint > balance) {
          return {
            amountValid: true,
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
  }, [debounceAmountStr, balance, t]);
  // console.log("      amountBigint  " + amountBigint);

  // gas fee
  // estimateGas: 241382509200000n
  // gasLimit: 21000
  // maxFeePerGas: 11494405200n
  // maxPriorityFeePerGas: 1097240700n
  // type: 1
  const {
    gasFee,
    loadingGasFee,
    error: loadGasFeeError,
  } = useGasFee(uniqueId, fromAddress, toAddress, amountBigint);
  console.log("      gasFee");
  console.log(gasFee);

  const { gasEthStr, gasGweiStr } = useMemo(() => {
    let gasEthStr = "";
    let gasGweiStr = "";
    if (
      gasFee?.estimateGas &&
      gasFee?.gasLimit &&
      gasFee?.type === GasFeeType.EIP1559
    ) {
      gasEthStr = ethers.utils.formatUnits(gasFee.estimateGas, "ether");
      gasGweiStr = ethers.utils.formatUnits(
        gasFee.estimateGas / BigInt(gasFee.gasLimit),
        "gwei",
      );
    }
    return { gasEthStr, gasGweiStr };
  }, [gasFee]);
  // console.log("      gasEthStr " + gasEthStr);
  // console.log("      gasGweiStr " + gasGweiStr);

  // const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);

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
      return <Text ml={1}>ETH</Text>;
    } else {
      return (
        <Flex>
          <Text textColor={"gray.500"}>0</Text>
          <Text ml={1}>ETH</Text>
        </Flex>
      );
    }
  }, [amountStr]);

  const onAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setAmountStr(value);
    },
    [setAmountStr],
  );

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

  const onNext = useCallback(() => {}, []);

  const BalanceView = useMemo(() => {
    return (
      <Flex mb={"20px"}>
        {loadingBalance ? (
          <LoadingView />
        ) : (
          <Text fontSize={"small"} color={"gray.500"}>
            {t("Send:available") + ": " + balanceStr + " ETH"}
          </Text>
        )}
      </Flex>
    );
  }, [balanceStr, loadingBalance, t]);

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
            // bg={"green"}
            w={"full"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"30px"}
          >
            <Input
              ref={valueRef}
              // bg={"yellow"}
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
            <Text position={"absolute"} mt={"90px"}>
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
              // bg={"green"}
              w={"full"}
              alignItems={"center"}
              h={"30px"}
              justifyContent={loadingGasFee ? "center" : "space-between"}
            >
              {/* {!!gasEthStr ?`${gasEthStr} ETH` : "0 ETH"} */}
              <Text>{gasEthStr ? `${gasEthStr} ETH` : "0 ETH"}</Text>
              {gasGweiStr && (
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Text>{`${gasGweiStr} Gwei`}</Text>
                  <IconChevronRight w={4} h={4} ml={"1px"} />
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      </>
    );
  }, [gasEthStr, gasGweiStr, loadingGasFee, t]);

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
            !debounceAmountStr ||
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
