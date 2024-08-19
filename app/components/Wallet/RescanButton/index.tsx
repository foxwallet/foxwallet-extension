import { IconLoading, IconRescan } from "@/components/Custom/Icon";
import { useChainMode } from "@/hooks/useChainMode";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { Flex, Text, keyframes } from "@chakra-ui/react";
import {
  ChainAssembleMode,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
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

  const { chainMode, availableChainUniqueIds } = useChainMode();

  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();

  const uniqueId = availableChainUniqueIds[0];
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);

  const { t } = useTranslation();
  const { progress, error, getProgress } = useSyncProgress(
    uniqueId,
    selectedAccount.account.address,
  );
  const { selectedBorderColor } = useThemeStyle();

  const onRescan = useCallback(() => {
    getProgress();
  }, [getProgress]);

  if (chainMode.mode !== ChainAssembleMode.SINGLE) return null;

  if (chainMode.uniqueId !== InnerChainUniqueId.ALEO_MAINNET) return null;

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
