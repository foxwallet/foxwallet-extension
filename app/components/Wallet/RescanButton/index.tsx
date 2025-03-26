import { IconLoading } from "@/components/Custom/Icon";
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
  const { chainMode } = useChainMode();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { selectedBorderColor } = useThemeStyle();

  const uniqueId = InnerChainUniqueId.ALEO_MAINNET; // aleo use only
  // selectedAccount 在evm私钥钱包时为undefined
  const selectedAccount = useMemo(() => {
    const accounts = getMatchAccountsWithUniqueId(uniqueId);
    if (accounts.length > 0) {
      return accounts[0];
    } else {
      return undefined;
    }
  }, [getMatchAccountsWithUniqueId, uniqueId]);

  const { t } = useTranslation();
  const { progress, error, getProgress } = useSyncProgress(
    uniqueId,
    selectedAccount?.account.address,
  );
  // console.log("      progress", progress);

  const onRescan = useCallback(() => {
    void getProgress();
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
      ml={2}
    >
      <IconLoading animation={`${rotateAnimation} infinite 2s linear`} />
      <Text ml={1} fontSize={10}>
        {paused ? t("Common:paused") : progress ? `${progress}%` : ""}
      </Text>
    </Flex>
  );
};

export default RescanButton;
