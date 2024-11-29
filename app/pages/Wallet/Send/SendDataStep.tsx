import {
  Text,
  Flex,
  Textarea,
  Divider,
  Button,
  VStack,
  Box,
  Input,
  IconButton,
  keyframes,
} from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import type React from "react";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import {
  type ChainUniqueId,
  type InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { useCoinBasic, useCoinService } from "@/hooks/useCoinService";
import { useDebounce } from "use-debounce";
import {
  IconChevronRight,
  IconLoading,
  IconSendContact,
  IconSwitch,
} from "@/components/Custom/Icon";
import { useNavigate } from "react-router-dom";
import { useDataRef } from "@/hooks/useDataRef";
import { type AssetType } from "@/common/types/asset";
import { useChainConfig } from "@/hooks/useGroupAccount";
import { AmountType } from "@/pages/Wallet/Send/index";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { BaseInput } from "@/components/Custom/Input";
import { LoadingView } from "@/components/Custom/Loading";
import { ethers } from "ethers";
import type { GasFee } from "core/types/GasFee";
import { type CoinType } from "core/types";

interface SendDataStepProps {
  toAddress: string;
}

export const SendDataStep = (props: SendDataStepProps) => {
  const { toAddress } = props;
  const { t } = useTranslation();
  // const navigate = useNavigate();

  const [amountStr, setAmountStr] = useState("");
  const [debounceAmountStr] = useDebounce(amountStr, 500);

  // for test
  // const walletAddress = "0x180325d018A5ED8144e78eEfdc9Ea893E8BEd50E";
  // const toAddress = "0x35b011d3a59323a9715edaf7a0dae3e3b93216d4";

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

  // loading gas
  const [loadingGas, setLoadingGas] = useState(false);
  const [loadGasFeeFail, setLoadGasFeeFail] = useState(false);
  const [loadGasFeeErrorMsg, setLoadGasFeeErrorMsg] = useState("");

  // useEffect(() => {
  //   try {
  //     const amountWei = ethers.utils.parseEther(debounceAmountStr ?? "");
  //     const amountBigint = amountWei.toBigInt();
  //   } catch (err) {
  //     // console.log(err);
  //   }
  // }, [coinService, debounceAmountStr]);

  // useEffect(() => {
  //   async function fetchBalance() {
  //     try {
  //       const fetchedBalance = await coinService.getBalance(walletAddress);
  //       console.log("balance  ", fetchedBalance);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  //   fetchBalance();
  // }, [coinService]);

  // useEffect(() => {
  //   if (debounceAmountStr) {
  //     onAmount(debounceAmountStr);
  //   }
  // }, [debounceAmountStr, onAmount]);

  // useEffect(() => {
  //   async function estimateGasFee() {
  //     try {
  //       console.log("      toAddress " + toAddress);
  //       const gas = (await coinService.estimateGasFee({
  //         tx: {
  //           from: walletAddress,
  //           to: toAddress,
  //           value: 10000000000n,
  //         },
  //       })) as GasFee<CoinType.ETH>;
  //       console.log("gas", gas);
  //     } catch (err) {
  //       console.log("gas error");
  //       console.log(err);
  //     }
  //   }
  //
  //   estimateGasFee();
  // }, [coinService, toAddress]);

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

  const BalanceView = useMemo(() => {
    return (
      <>
        {/* <LoadingView /> */}
        <Text mb={"20px"} fontSize={"small"} color={"gray.500"}>
          {t("Send:available") + ": "}
        </Text>
      </>
    );
  }, [t]);

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
        </Flex>
        {BalanceView}
      </>
    );
  }, [BalanceView, amountStr, amountUnit, onAmountChange, t]);

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
          {loadingGas ? (
            <LoadingView />
          ) : (
            <Flex
              // bg={"green"}
              w={"full"}
              alignItems={"center"}
              h={"30px"}
              justifyContent={loadingGas ? "center" : "space-between"}
            >
              <Text>333</Text>
              <Flex justifyContent={"center"} alignItems={"center"}>
                <Text>222</Text>
                <IconChevronRight w={4} h={4} ml={"1px"} />
              </Flex>
            </Flex>
          )}
        </Flex>
      </>
    );
  }, [loadingGas, t]);

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
          onClick={() => {}}
          isDisabled={
            !amountStr || !debounceAmountStr || loadingGas || loadGasFeeFail
          }
        >
          {t("Common:confirm")}
        </Button>
      </Content>
    </Box>
  );
};
