import { Box, Flex, keyframes, Spinner, Text } from "@chakra-ui/react";
import { IconLoading } from "@/components/Custom/Icon";
import type React from "react";
import { useTranslation } from "react-i18next";

interface LoadingProps {
  isLoading?: boolean;
  hint?: string;
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
  const { t } = useTranslation();
  const { isLoading = true, hint = t("Common:pleaseWait"), children } = props;
  return (
    <Box position="relative">
      {isLoading && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="full"
          height="full"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Spinner w={10} h={10} color={"white"} thickness="4px" />
          {children || (
            <Text color={"white"} mt={"20px"}>
              {hint}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};
