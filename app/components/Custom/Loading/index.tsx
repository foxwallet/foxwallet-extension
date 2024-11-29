import { H1 } from "@/common/theme/components/text";
import { Flex, keyframes, Spinner } from "@chakra-ui/react";
import { IconLoading } from "@/components/Custom/Icon";
import type React from "react";

interface LoadingProps {}

export const LoadingScreen = (props: LoadingProps) => {
  return (
    <Flex w="full" h="full" justifyContent={"center"} alignItems={"center"}>
      <Spinner w={10} h={10} />
    </Flex>
  );
};

export const LoadingView = () => {
  const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

  return (
    <IconLoading
      w={5}
      h={5}
      mr={1}
      stroke={"green.600"}
      animation={`${rotateAnimation} infinite 2s linear`}
    />
  );
};
