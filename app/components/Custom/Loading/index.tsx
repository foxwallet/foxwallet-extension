import { Flex, Spinner } from "@chakra-ui/react";

export const LoadingScreen = () => {
  return (
    <Flex w="full" h="full" justifyContent={"center"} alignItems={"center"}>
      <Spinner size={"lg"} w={20} h={20} />
    </Flex>
  );
};
