import {
  Flex,
  useToast,
  Text,
  Box,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { IconCheckLineBlack, IconCloseLineBlack } from "../../Custom/Icon";
import { useTranslation } from "react-i18next";

export const useTransactionSettledToast = () => {
  const { t } = useTranslation();
  const bg = useColorModeValue("black", "white");
  const iconBg = useColorModeValue("white", "black");
  const textColor = useColorModeValue("white", "black");

  const toast = useToast({
    position: "top",
    render: ({ status }) => (
      <VStack>
        <Box
          mt={10}
          p={2.5}
          borderRadius={8}
          bg={bg}
          justifyContent={"center"}
          alignItems={"center"}
          display={"inline-flex"}
          alignSelf={"center"}
        >
          <Flex
            bg={iconBg}
            height={18}
            width={18}
            borderRadius={9}
            justify={"center"}
            align={"center"}
            mr={2.5}
          >
            {status === "success" ? (
              <IconCheckLineBlack />
            ) : (
              <IconCloseLineBlack />
            )}
          </Flex>
          <Text color={textColor} fontWeight={500}>
            {status === "success" ? t("Tx:successToast") : t("Tx:failToast")}
          </Text>
        </Box>
      </VStack>
    ),
    duration: 1000,
  });

  return {
    showToast: (success: boolean) => {
      const toastId = `transaction-settled-toast`;

      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          status: success ? "success" : "error",
          duration: 6000,
        });
      }
    },
  };
};
