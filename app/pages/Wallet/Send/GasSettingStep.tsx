import {
  Button,
  Flex,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { useGasGrade } from "@/hooks/useGasGrade";
import {
  type GasFee,
  type GasFeeEIP1559,
  type GasFeeLegacy,
  GasFeeType,
  type GasFeeUTXO,
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
import { BigNumber, utils } from "ethers";
import { isNotEmpty } from "core/utils/is";
import { timeout } from "@/common/utils/timeout";
import { BaseInput, BaseInputGroup } from "@/components/Custom/Input";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";

const GasGrades: GasGrade[] = [GasGrade.Fast, GasGrade.Middle, GasGrade.Slow];

function isNumeric(str: string) {
  return /^-?\d+(\.\d+)?$/.test(str);
}

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

type GasGradeSelectorProps<GFT extends GasFeeType> = {
  feeType: GasFeeType;
  gasGrade: GasGradeData<GFT>;
  gasUnit: string;
  isCustom: boolean;
  customGasLimit: number;
  selectedGrade?: GasGrade;
  gasSymbol: string;
  gasDecimals: number;
  onSelectGrade: (grade: GasGrade) => void;
};

const GasGradeSelector = (props: GasGradeSelectorProps<GasFeeType>) => {
  const {
    gasGrade,
    isCustom,
    selectedGrade,
    customGasLimit,
    gasSymbol,
    gasDecimals,
    gasUnit,
    onSelectGrade,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <H6 mb={"2"}>{t("GasSetting:selectGasFee")}</H6>
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
                onSelectGrade={onSelectGrade}
                isSelected={isSelected}
                amountStr={amountStr}
                selectDesc={gasFeeStr}
              />
            );
          })}
      </VStack>
    </>
  );
};

type GradeItemViewProps = {
  grade: GasGrade;
  gradeData: GasGradeDataItem<GasFeeType>;
  isSelected: boolean;
  onSelectGrade: (grade: GasGrade) => void;
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
      h={"50px"}
      borderRadius={4}
      align={"center"}
      justify={"space-between"}
      cursor={"pointer"}
      onClick={() => {
        onSelectGrade(grade);
      }}
      pr={2}
    >
      <Flex
        w={"full"}
        h={"full"}
        mr={2}
        align={"center"}
        justify={"space-between"}
      >
        <Flex key={"speedAndGwei"} direction={"column"} w={"80px"} ml={2}>
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

type CustomGasViewProps = {
  showData: {
    showMaxFeeSetting: boolean;
    showGasPriceSetting: boolean;
    showGasLimitSetting: boolean;
  };
  currentData: {
    gasPrice: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    gasLimit: number;
    feeRate: number | null;
  };
  isAdvanced: boolean;
  setAdvanced: () => void;
  gasUnit: string;
  feeType?: GasFeeType;
  onConfirm: (data: Step3Data) => void;
};

const CustomGasView = (props: CustomGasViewProps) => {
  const {
    isAdvanced,
    setAdvanced,
    currentData,
    showData,
    gasUnit,
    feeType,
    onConfirm,
  } = props;
  const { showMaxFeeSetting, showGasPriceSetting, showGasLimitSetting } =
    showData;
  const { t } = useTranslation();

  // maxPriorityFeePerGas
  const paramMaxPriorityFeePerGas = useMemo(() => {
    return showMaxFeeSetting
      ? utils.formatUnits(currentData.maxPriorityFeePerGas, "gwei")
      : "";
  }, [currentData.maxPriorityFeePerGas, showMaxFeeSetting]);
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(
    paramMaxPriorityFeePerGas,
  );
  const onMaxPriorityFeePerGasChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setMaxPriorityFeePerGas(event.target.value);
    },
    [],
  );

  // maxFeePerGas
  const paramMaxFeePerGas = useMemo(() => {
    return showMaxFeeSetting
      ? utils.formatUnits(currentData.maxFeePerGas, "gwei")
      : "";
  }, [currentData.maxFeePerGas, showMaxFeeSetting]);
  const [maxFeePerGas, setMaxFeePerGas] = useState(paramMaxFeePerGas);
  const onMaxFeePerGasChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setMaxFeePerGas(event.target.value);
    },
    [],
  );

  // gasPrice
  const paramGasPrice = useMemo(() => {
    return showGasPriceSetting
      ? utils.formatUnits(currentData.gasPrice, "gwei")
      : "";
  }, [currentData.gasPrice, showGasPriceSetting]);
  const [gasPrice, setGasPrice] = useState(paramGasPrice);
  const onGasPriceChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setGasPrice(event.target.value);
    },
    [],
  );

  // gasLimit
  const [gasLimit, setGasLimit] = useState(currentData.gasLimit.toString());
  const onGasLimitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setGasLimit(event.target.value);
    },
    [],
  );

  const {
    maxPriorityFeePerGasValid,
    maxFeePerGasValid,
    gasPriceValid,
    gasLimitValid,
  } = useMemo(() => {
    return {
      maxPriorityFeePerGasValid: isNumeric(maxPriorityFeePerGas),
      maxFeePerGasValid: isNumeric(maxFeePerGas),
      gasPriceValid: isNumeric(gasPrice),
      gasLimitValid: isNumeric(gasLimit),
    };
  }, [gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas]);

  const canConfirm = useMemo(() => {
    if (!gasLimitValid) {
      return false;
    }
    if (maxPriorityFeePerGasValid && maxFeePerGasValid) {
      return true;
    }
    if (gasPriceValid) {
      return true;
    }
  }, [
    gasLimitValid,
    gasPriceValid,
    maxFeePerGasValid,
    maxPriorityFeePerGasValid,
  ]);

  const onCustom = useCallback(() => {
    const newGasFee =
      feeType === GasFeeType.EIP1559
        ? {
            estimateGas:
              utils.parseUnits(maxFeePerGas, "gwei").toBigInt() *
              BigInt(gasLimit),
            gasLimit: Number(gasLimit),
            type: feeType,
            maxFeePerGas: utils.parseUnits(maxFeePerGas, "gwei").toBigInt(),
            maxPriorityFeePerGas: utils
              .parseUnits(maxPriorityFeePerGas, "gwei")
              .toBigInt(),
          }
        : feeType === GasFeeType.LEGACY
        ? {
            estimateGas:
              utils.parseUnits(gasPrice, "gwei").toBigInt() * BigInt(gasLimit),
            gasLimit: Number(gasLimit),
            type: feeType,
            gasPrice: utils.parseUnits(gasPrice, "gwei").toBigInt(),
          }
        : undefined;
    onConfirm({
      isCustom: true,
      selectedGrade: undefined,
      gasFee: newGasFee,
    });
  }, [
    feeType,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    onConfirm,
  ]);

  return (
    <Flex mt={4} direction={"column"}>
      <Flex
        w={"full"}
        h={"40px"}
        justifyContent={"space-between"}
        alignItems={"center"}
        pr={2}
        cursor={"pointer"}
        onClick={setAdvanced}
        mb={2}
        bg={isAdvanced ? "" : "#f9f9f9"}
        borderRadius={4}
      >
        <H6>{t("GasSetting:advanced")}</H6>
        {isAdvanced ? <IconCheckboxSelected /> : <Flex w={"18px"} />}
      </Flex>
      {isAdvanced ? (
        <Flex direction={"column"}>
          {showMaxFeeSetting && (
            <>
              <BaseInputGroup
                container={{ mt: 2 }}
                title={t("GasSetting:maxPriorityFeeTitle")}
                inputProps={{
                  defaultValue: maxPriorityFeePerGas,
                  onChange: onMaxPriorityFeePerGasChange,
                  isInvalid: !maxPriorityFeePerGasValid,
                }}
                rightElement={
                  <InputRightElement
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    height="100%"
                    pr={4}
                  >
                    <Text color={"#777e90"}>{gasUnit}</Text>
                  </InputRightElement>
                }
              />
              <BaseInputGroup
                container={{ mt: 2 }}
                title={t("GasSetting:maxFeeTitle")}
                inputProps={{
                  defaultValue: maxFeePerGas,
                  onChange: onMaxFeePerGasChange,
                  isInvalid: !maxFeePerGasValid,
                }}
                rightElement={
                  <InputRightElement
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    height="100%"
                    pr={4}
                  >
                    <Text color={"#777e90"}>{gasUnit}</Text>
                  </InputRightElement>
                }
              />
            </>
          )}
          {showGasPriceSetting && (
            <BaseInputGroup
              container={{ mt: 2 }}
              title={"Gas price"}
              inputProps={{
                defaultValue: gasPrice,
                onChange: onGasPriceChange,
                isInvalid: !gasPriceValid,
              }}
              rightElement={
                <InputRightElement
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  height="100%"
                  pr={4}
                >
                  <Text color={"#777e90"}>{gasUnit}</Text>
                </InputRightElement>
              }
            />
          )}
          {showGasLimitSetting && (
            <BaseInput
              title={t("GasSetting:gasLimitTitle")}
              container={{ mt: "2" }}
              value={gasLimit}
              onChange={onGasLimitChange}
              isInvalid={!gasLimitValid}
            />
          )}
          <Button mt={5} w={"full"} onClick={onCustom} isDisabled={!canConfirm}>
            {t("Common:confirm")}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  );
};

interface GasSettingStepProps {
  uniqueId: ChainUniqueId;
  onConfirm: (data: Step3Data) => void;
  step3Data?: Step3Data;
  token?: TokenV2;
}

export const GasSettingStep = (props: GasSettingStepProps) => {
  const { onConfirm, uniqueId, step3Data = {}, token } = props;
  const { t } = useTranslation();
  const {
    gasFee,
    isCustom = false,
    selectedGrade: paramSelectedGrade,
  } = step3Data;
  const { gasGrade, loadingGasGrade } = useGasGrade(uniqueId);
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);
  const [advanceSettings, setAdvanceSettings] = useState(
    uniqueId === InnerChainUniqueId.ETHEREUM ? isCustom : true,
  );
  const networkFeeData = useNetworkFeeData(uniqueId);

  // console.log("      gasGrade", gasGrade);
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

  const { showMaxFeeSetting, showGasPriceSetting, showGasLimitSetting } =
    useMemo(() => {
      return {
        showMaxFeeSetting: gasFee?.type === GasFeeType.EIP1559,
        showGasPriceSetting: gasFee?.type === GasFeeType.LEGACY,
        showGasLimitSetting:
          gasFee?.type === GasFeeType.LEGACY ||
          gasFee?.type === GasFeeType.EIP1559,
      };
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
      gasLimit:
        (gasFee as GasFeeLegacy).gasLimit ?? constants.DEFAULT_GAS_LIMIT,
      feeRate: (gasFee as GasFeeUTXO).feeRate ?? null,
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

  const [pageSelectGrade, setPageSelectGrade] = useState<
    GasGrade | undefined
  >();
  const defaultSelectedGrade = useMemo(() => {
    if (!gasGrade) {
      return undefined;
    }
    const matchingGrade = GasGrades.find((grade) => {
      const gasGradeDataItem = gasGrade[grade];
      if (isNotEmpty(gasGradeDataItem)) {
        const gradeDataKeys = Object.keys(gasGradeDataItem);
        for (const gradeDataKey of gradeDataKeys) {
          // @ts-expect-error ignore
          const property = gasGradeDataItem[gradeDataKey] as number;
          switch (gradeDataKey) {
            case "feeRate":
              if (currentData.feeRate !== property) {
                return false;
              }
              break;
            case "maxFeePerGas":
            case "maxPriorityFeePerGas":
              if (
                !currentData[gradeDataKey] ||
                utils.parseUnits(`${property}`, "gwei").toBigInt() !==
                  currentData[gradeDataKey]
              ) {
                return false;
              }
              break;
            case "gasPrice":
              if (
                !currentData.gasPrice ||
                utils.parseUnits(`${property}`, "gwei").toBigInt() !==
                  currentData.gasPrice
              ) {
                return false;
              }
              break;
            default:
              break;
          }
        }
        return true;
      }
      return false;
    });
    // console.log("      matchingGrade", matchingGrade);
    return matchingGrade;
  }, [currentData, gasGrade]);

  const selectedGrade = useMemo(() => {
    if (advanceSettings) {
      return undefined;
    }
    return pageSelectGrade ?? defaultSelectedGrade;
  }, [defaultSelectedGrade, advanceSettings, pageSelectGrade]);
  // console.log("      selectedGrade", selectedGrade);

  const onSelectGrade = useCallback(
    async (data: GasGrade) => {
      setAdvanceSettings(false);
      setPageSelectGrade(data);
      const gasGradeDataItem = gasGrade?.[data];
      if (isNotEmpty(gasGradeDataItem)) {
        const gradeDataKeys = Object.keys(gasGradeDataItem);
        const gasLimit = currentData.gasLimit;
        const gradeData: EditableFields = {};
        let estimateGas: bigint = 0n;
        for (const gradeDataKey of gradeDataKeys) {
          // @ts-expect-error ignore
          const property = gasGradeDataItem[gradeDataKey] as number;
          switch (gradeDataKey) {
            case "feeRate":
              gradeData.feeRate = property;
              break;
            case "maxFeePerGas": {
              const maxFeePerGas = utils
                .parseUnits(`${property}`, "gwei")
                .toBigInt();
              gradeData.maxFeePerGas = maxFeePerGas;
              estimateGas = maxFeePerGas * BigInt(gasLimit);
              break;
            }

            case "maxPriorityFeePerGas":
              gradeData.maxPriorityFeePerGas = utils
                .parseUnits(`${property}`, "gwei")
                .toBigInt();
              break;
            case "gasPrice": {
              const gasPrice = utils
                .parseUnits(`${property}`, "gwei")
                .toBigInt();
              gradeData.gasPrice = gasPrice;
              estimateGas = gasPrice * BigInt(gasLimit);
              break;
            }

            default:
              break;
          }
        }
        updateCurrentData({ ...currentData, ...gradeData });
        await timeout(0);

        const newGasFee =
          gasFee?.type === GasFeeType.EIP1559
            ? {
                estimateGas,
                gasLimit,
                type: gasFee?.type,
                maxFeePerGas: gradeData.maxFeePerGas,
                maxPriorityFeePerGas: gradeData.maxPriorityFeePerGas,
              }
            : gasFee?.type === GasFeeType.LEGACY
            ? {
                estimateGas,
                gasLimit,
                type: gasFee?.type,
                gasPrice: gradeData.gasPrice,
              }
            : undefined;
        onConfirm({
          isCustom: false,
          selectedGrade: data,
          // @ts-expect-error ignore
          gasFee: newGasFee,
        });
      }
    },
    [currentData, gasFee, gasGrade, onConfirm, updateCurrentData],
  );

  const maxFeeError = useMemo(() => {
    if (
      currentData.maxFeePerGas &&
      currentData.maxPriorityFeePerGas > currentData.maxFeePerGas
    ) {
      return t("GasSetting:max_priority_fee_remind");
    }
    return undefined;
  }, [currentData.maxFeePerGas, currentData.maxPriorityFeePerGas, t]);

  const disableConfirm = useMemo(() => {
    if (gasFee?.type === GasFeeType.EIP1559) {
      return !!maxFeeError;
    }
    return false;
  }, [gasFee, maxFeeError]);

  return (
    <Content h={"400px"}>
      <Flex
        direction={"column"}
        overflowY={"auto"}
        marginBottom={"10px"}
        maxH={510}
        sx={HIDE_SCROLL_BAR_CSS}
        // bg={"yellow"}
      >
        {!!gasGrade && !!gasFee ? (
          <GasGradeSelector
            feeType={gasFee.type}
            gasGrade={gasGrade}
            gasUnit={gasUnit}
            isCustom={advanceSettings}
            customGasLimit={currentData.gasLimit}
            gasDecimals={nativeCurrency.decimals}
            gasSymbol={nativeCurrency.symbol}
            selectedGrade={selectedGrade}
            onSelectGrade={onSelectGrade}
          />
        ) : null}
        {/* <CustomGasView */}
        {/*  feeType={gasFee?.type} */}
        {/*  showData={{ */}
        {/*    showGasPriceSetting, */}
        {/*    showGasLimitSetting, */}
        {/*    showMaxFeeSetting, */}
        {/*  }} */}
        {/*  gasUnit={gasUnit} */}
        {/*  currentData={currentData} */}
        {/*  isAdvanced={advanceSettings} */}
        {/*  setAdvanced={() => { */}
        {/*    setAdvanceSettings(true); */}
        {/*  }} */}
        {/*  onConfirm={onConfirm} */}
        {/* /> */}
      </Flex>
    </Content>
  );
};
