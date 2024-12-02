import { H1 } from "@/common/theme/components/text";
import { Box, Flex, keyframes, Spinner } from "@chakra-ui/react";
import { IconLoading } from "@/components/Custom/Icon";
import type React from "react";

interface LoadingProps {
  isLoading?: boolean;
  children?: React.ReactNode;
}

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

export const LoadingOverlay = (props: LoadingProps) => {
  const { isLoading = true, children } = props;
  return (
    <Box position="relative">
      {isLoading && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          backgroundColor="rgba(0, 0, 0, 0.3)"
          zIndex="9999"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* <Spinner size="xl" color="white" thickness="4px" /> */}
          <Spinner w={10} h={10} />
        </Box>
      )}
      {children}
    </Box>
  );
};
