import { IconLoading, IconRescan } from "@/components/Custom/Icon";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { Flex, Text, keyframes } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";

const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

const RescanButton = () => {
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { progress, error, getProgress } = useSyncProgress(
    uniqueId,
    selectedAccount.address,
  );

  const onRescan = useCallback(() => {
    getProgress();
  }, [getProgress]);

  const isRescaning = useMemo(() => !progress || progress < 100, [progress]);

  if (!error && progress && progress >= 100) return null;

  return (
    <Flex
      as="button"
      onClick={onRescan}
      borderWidth={"1px"}
      borderRadius={"4px"}
      borderColor={"#EAECEC"}
      h={5}
      px={1}
      justify={"center"}
      align={"center"}
    >
      {isRescaning ? (
        <IconLoading animation={`${rotateAnimation} infinite 2s linear`} />
      ) : (
        <IconRescan />
      )}
      <Text ml={1} fontSize={10} color={"black"}>
        {progress}%
      </Text>
    </Flex>
  );
};

export default RescanButton;