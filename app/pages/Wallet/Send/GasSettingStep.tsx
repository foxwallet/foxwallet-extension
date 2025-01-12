import {
  Button,
  Divider,
  Flex,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import React, { useMemo, useState } from "react";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useGasGrade } from "@/hooks/useGasGrade";
import {
  type GasFee,
  type GasFeeType,
  GasGrade,
  type GasGradeDataItem,
} from "core/types/GasFee";
import { useCoinService } from "@/hooks/useCoinService";
import type { CoinType } from "core/types";

const GasGrades: GasGrade[] = [GasGrade.Fast, GasGrade.Middle, GasGrade.Slow];

type GradeItemViewProps = {
  grade: GasGrade;
  gradeData: GasGradeDataItem<GasFeeType>;
  onSelectGrade: () => void;
};

const GradeItemView = (props: GradeItemViewProps) => {
  const { t } = useTranslation();
  const { grade, gradeData, onSelectGrade } = props;

  const gradeName = useMemo(() => {
    switch (grade) {
      case GasGrade.Fast:
        return t("GasSetting:speed_fast");
      case GasGrade.Middle:
        return t("GasSetting:speed_middle");
      case GasGrade.Slow:
        return t("GasSetting:speed_slow");
      default:
        return String(grade);
    }
  }, [grade, t]);

  return <Text>333</Text>;
};

interface GasSettingStepProps {
  uniqueId: ChainUniqueId;
  onConfirm: () => void;
  currGasGFee?: GasFee<CoinType>;
}

export const GasSettingStep = (props: GasSettingStepProps) => {
  const { onConfirm, uniqueId, currGasGFee } = props;
  const { t } = useTranslation();
  const { gasGrade, loadingGasGrade } = useGasGrade(uniqueId);
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);
  const [advanceSettings, setAdvanceSettings] = useState(false);

  console.log("      currGasGFee", currGasGFee);

  const gasUnit = useMemo(() => {
    return coinService.gasUnit();
  }, [coinService]);

  // const feeType: GasFeeType = useMemo(() => gasFeeData.type, [gasFeeData]);

  return (
    <Content>
      <H6 mb={"2"}>{t("Send:selectGasFee")}</H6>
      <VStack spacing={4}>
        {gasGrade &&
          Object.entries(gasGrade).map(([grade, gradeData], index) => {
            return (
              <GradeItemView
                key={grade}
                grade={grade as GasGrade}
                gradeData={gradeData}
                onSelectGrade={() => {}}
              />
            );
          })}
      </VStack>
    </Content>
  );
};
