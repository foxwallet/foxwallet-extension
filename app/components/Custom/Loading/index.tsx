import { Flex, Spinner } from "@chakra-ui/react";

export const LoadingScreen = () => {
  return (
    <Flex w="full" h="full" justifyContent={"center"} alignItems={"center"}>
      <Spinner w={10} h={10} />
    </Flex>
  );
};
