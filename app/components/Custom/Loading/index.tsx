import { H1 } from "@/common/theme/components/text";
import { Flex, Spinner } from "@chakra-ui/react";

interface LoadingProps {}

export const LoadingScreen = (props: LoadingProps) => {
  return (
    <Flex w="full" h="full" justifyContent={"center"} alignItems={"center"}>
      <Spinner w={10} h={10} />
    </Flex>
  );
};
