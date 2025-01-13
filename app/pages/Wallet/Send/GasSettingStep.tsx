import { Flex, Text, VStack } from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import React, { useCallback, useMemo, useState } from "react";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useGasGrade } from "@/hooks/useGasGrade";
import {
  type GasFee,
  type GasFeeEIP1559,
  type GasFeeLegacy,
  GasFeeType,
  GasGrade,
  type GasGradeData,
  type GasGradeDataItem,
} from "core/types/GasFee";
import { useCoinService } from "@/hooks/useCoinService";
import type { CoinType } from "core/types";
import { useNetworkFeeData } from "@/hooks/useGasFee";
import { IconCheckboxSelected } from "@/components/Custom/Icon";
import constants from "core/coins/ETH/constants";
import { type TokenV2 } from "core/types/Token";
import { formatGasStr } from "core/utils/num";
import { BigNumber } from "ethers";

const GasGrades: GasGrade[] = [GasGrade.Fast, GasGrade.Middle, GasGrade.Slow];

export type Step3Data = {
  isCustom?: boolean; // 用户自己输入数据
  selectedGrade?: GasGrade; // 用户选择了3个档位中的一个, 与上面的字段相斥
  gasFee?: GasFee<CoinType>;
};

type EditableFields = Partial<{
  gasPrice: bigint | null;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  gasLimit: number | null;
  feeRate: number | null;
}>;

type GasGradeSelectorParams<GFT extends GasFeeType> = {
  feeType: GasFeeType;
  gasGrade: GasGradeData<GFT>;
  gasUnit: string;
  isCustom: boolean;
  customGasLimit: number;
  selectedGrade?: GasGrade;
  gasSymbol: string;
  gasDecimals: number;
};

const GasGradeSelector = (props: GasGradeSelectorParams<GasFeeType>) => {
  const {
    gasGrade,
    isCustom,
    selectedGrade,
    customGasLimit,
    gasSymbol,
    gasDecimals,
    gasUnit,
  } = props;
  return (
    <VStack spacing={2}>
      {gasGrade &&
        Object.entries(gasGrade).map(([grade, gradeData], index) => {
          const isSelected = isCustom
            ? false
            : selectedGrade
            ? selectedGrade === grade
            : grade === GasGrade.Middle;

          let gasPrice: number = 0;
          if ("maxFeePerGas" in gradeData) {
            gasPrice = gradeData.maxFeePerGas; // GasFeeType.EIP1559
          } else if ("gasPrice" in gradeData) {
            gasPrice = gradeData.gasPrice; // GasFeeType.LEGACY
          }
          const estimateGas =
            BigInt(Math.floor(gasPrice * customGasLimit)) * 10n ** 9n;
          const amountStr = formatGasStr(
            gasSymbol,
            BigNumber.from(estimateGas.toString()),
            gasDecimals,
          );
          const gasFeeStr = `${gasPrice.toFixed(4).toString()} ${gasUnit}`;
          return (
            <GradeItemView
              key={grade}
              grade={grade as GasGrade}
              gradeData={gradeData}
              onSelectGrade={() => {}}
              isSelected={isSelected}
              amountStr={amountStr}
              selectDesc={gasFeeStr}
            />
          );
        })}
    </VStack>
  );
};

type GradeItemViewProps = {
  grade: GasGrade;
  gradeData: GasGradeDataItem<GasFeeType>;
  isSelected: boolean;
  onSelectGrade: (
    grade: GasGrade,
    gradeData: GasGradeDataItem<GasFeeType>,
  ) => void;
  amountStr: string; // e.g.   0.00003434 ETH
  selectDesc: string; // e.g.  4.5656776 Gwei
};

const GradeItemView = (props: GradeItemViewProps) => {
  const { t } = useTranslation();
  const { grade, gradeData, onSelectGrade, isSelected, amountStr, selectDesc } =
    props;

  const gradeName = useMemo(() => {
    switch (grade) {
      case GasGrade.Fast:
        return t("GasSetting:fast");
      case GasGrade.Middle:
        return t("GasSetting:middle");
      case GasGrade.Slow:
        return t("GasSetting:slow");
      default:
        return String(grade);
    }
  }, [grade, t]);

  return (
    <Flex
      bg={"#f9f9f9"}
      w={"full"}
      h={"45px"}
      borderRadius={4}
      align={"center"}
      justify={"space-between"}
      cursor={"pointer"}
      onClick={() => {
        onSelectGrade(grade, gradeData);
      }}
    >
      <Flex
        w={"full"}
        h={"full"}
        // bg={"green.100"}
        mr={2}
        align={"center"}
        justify={"space-between"}
      >
        <Flex key={"speedAndGwei"} direction={"column"} w={"80px"}>
          <Text fontSize={"12px"} fontWeight={"bold"}>
            {gradeName}
          </Text>
          <Text fontSize={"10px"} color={"#777e90"}>
            {selectDesc}
          </Text>
        </Flex>
        <Flex w={"120px"}>
          <Text>{amountStr}</Text>
        </Flex>
        <Flex w={"40px"} justify={"end"}>
          <Text>{gradeData.label}</Text>
        </Flex>
      </Flex>
      {isSelected ? <IconCheckboxSelected /> : <Flex w={"18px"} />}
    </Flex>
  );
};

interface GasSettingStepProps {
  uniqueId: ChainUniqueId;
  onConfirm: () => void;
  step3Data?: Step3Data;
  token?: TokenV2;
}

export const GasSettingStep = (props: GasSettingStepProps) => {
  const { onConfirm, uniqueId, step3Data = {}, token } = props;
  const { gasFee, isCustom = false, selectedGrade } = step3Data;
  const { t } = useTranslation();
  const { gasGrade, loadingGasGrade } = useGasGrade(uniqueId);
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);
  const [advanceSettings, setAdvanceSettings] = useState(false);
  const networkFeeData = useNetworkFeeData(uniqueId);

  console.log("      gasGrade", gasGrade);
  console.log("      gasFee", gasFee);

  const gasUnit = useMemo(() => {
    return coinService.gasUnit();
  }, [coinService]);

  const editableField: string[] = useMemo(() => {
    switch (gasFee?.type) {
      case GasFeeType.EIP1559:
        return ["maxPriorityFeePerGas", "maxFeePerGas", "gasLimit"];
      case GasFeeType.LEGACY:
        return ["gasPrice", "gasLimit"];
      default:
        return [];
    }
  }, [gasFee]);

  // const {
  //   recommendGasPrice = null,
  //   recommendMaxFeePerGas = null,
  //   recommendMaxPriorityFeePerGas = null,
  //   recommendGasLimit = null,
  // } = useMemo(() => {
  //   let maxFeePerGas: bigint | null = (gasFee as GasFeeEIP1559)
  //     .maxFeePerGas;
  //   if (
  //     networkFeeData?.eip1559 &&
  //     isNotEmpty(maxFeePerGas) &&
  //     networkFeeData.maxFeePerGas > maxFeePerGas
  //   ) {
  //     maxFeePerGas = networkFeeData.maxFeePerGas;
  //   }
  //   return {
  //     recommendGasPrice: (gasFee as GasFeeLegacy).gasPrice ?? null,
  //     recommendMaxFeePerGas: maxFeePerGas ?? null,
  //     recommendMaxPriorityFeePerGas:
  //       (gasFee as GasFeeEIP1559).maxPriorityFeePerGas ?? null,
  //     recommendGasLimit: (gasFee as GasFeeLegacy).gasLimit ?? null,
  //     recommendFeeRate: (gasFee as GasFeeUTXO).feeRate ?? null,
  //   };
  // }, [gasFee, networkFeeData]);
  //
  const [currentData, setCurrentData] = useState(() => {
    return {
      gasPrice: (gasFee as GasFeeLegacy).gasPrice ?? null,
      maxFeePerGas: (gasFee as GasFeeEIP1559).maxFeePerGas ?? null,
      maxPriorityFeePerGas:
        (gasFee as GasFeeEIP1559).maxPriorityFeePerGas ?? null,
      gasLimit: (gasFee as GasFeeLegacy).gasLimit ?? null,
    };
  });

  const updateCurrentData = useCallback(
    (newData: EditableFields) => {
      const validPart: Partial<GasFee<CoinType>> = {};
      Object.keys(newData)
        .filter((key) => {
          return editableField.includes(key as keyof GasFee<CoinType>);
        })
        .forEach((validKey) => {
          // @ts-expect-error ignore
          validPart[validKey] = newData[validKey];
        });
      setCurrentData({
        ...currentData,
        ...validPart,
      });
    },
    [currentData, editableField, setCurrentData],
  );

  return (
    <Content>
      <H6 mb={"2"}>{t("Send:selectGasFee")}</H6>
      {!!gasGrade && !!gasFee ? (
        <GasGradeSelector
          feeType={gasFee.type}
          gasGrade={gasGrade}
          gasUnit={gasUnit}
          isCustom={isCustom}
          customGasLimit={currentData.gasLimit ?? constants.DEFAULT_GAS_LIMIT}
          gasDecimals={nativeCurrency.decimals}
          gasSymbol={nativeCurrency.symbol}
          selectedGrade={selectedGrade}
        />
      ) : null}
    </Content>
  );
};
