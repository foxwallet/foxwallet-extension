import {
  Box,
  type BoxProps,
  Flex,
  keyframes,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { IconLoading } from "@/components/Custom/Icon";
import type React from "react";
import { useTranslation } from "react-i18next";

interface LoadingProps extends BoxProps {
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

export const LoadingView: React.FC<LoadingProps> = ({
  isLoading = true,
  style,
  ...restProps // 捕获其他所有HTML div属性
}) => {
  const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

  return (
    <IconLoading
      mr={1}
      stroke={"green.600"}
      animation={`${rotateAnimation} infinite 2s linear`}
      {...restProps}
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
