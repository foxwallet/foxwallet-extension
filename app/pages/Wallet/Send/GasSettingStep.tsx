import { Button, Divider, Flex, Text, Textarea } from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "@/hooks/useCoinService";
import { useDebounce } from "use-debounce";
import { IconSendContact } from "@/components/Custom/Icon";
import { useNavigate } from "react-router-dom";

interface GasSettingStepProps {
  onConfirm: () => void;
}

export const GasSettingStep = (props: GasSettingStepProps) => {
  const { onConfirm } = props;
  const { t } = useTranslation();

  return (
    <Content>
      <H6 mb={"2"}>{t("Send:to")}</H6>
      <Flex
        minH={"200px"}
        borderRadius={"8px"}
        borderColor={"gray.50"}
        borderWidth={"1.5px"}
        direction={"column"}
        p={2}
        justify={"space-between"}
      ></Flex>
    </Content>
  );
};
