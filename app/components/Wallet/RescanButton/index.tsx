import { IconLoading, IconRescan } from "@/components/Custom/Icon";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { Flex, Text, keyframes } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

interface RescanButtonProps {
  paused: boolean;
}

const RescanButton = (props: RescanButtonProps) => {
  const { paused } = props;
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { t } = useTranslation();
  const { progress, error, getProgress } = useSyncProgress(
    uniqueId,
    selectedAccount.address,
  );
  const { selectedBorderColor } = useThemeStyle();

  const onRescan = useCallback(() => {
    getProgress();
  }, [getProgress]);

  if (!error && progress && progress >= 100) return null;

  return (
    <Flex
      onClick={onRescan}
      borderWidth={"1px"}
      borderRadius={"4px"}
      borderColor={selectedBorderColor}
      h={5}
      px={1}
      justify={"center"}
      align={"center"}
    >
      <IconLoading animation={`${rotateAnimation} infinite 2s linear`} />
      <Text ml={1} fontSize={10}>
        {paused ? t("Common:paused") : progress ? `${progress}%` : ""}
      </Text>
    </Flex>
  );
};

export default RescanButton;
