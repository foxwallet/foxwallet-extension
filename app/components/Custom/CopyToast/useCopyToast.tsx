import { Flex, useToast, Text, Box, VStack } from "@chakra-ui/react";
import { IconCheckLineBlack } from "../Icon";
import { useTranslation } from "react-i18next";

const ToastId = "copy-toast";
export const useCopyToast = () => {
  const { t } = useTranslation();
  const toast = useToast({
    position: "top",
    render: () => (
      <VStack>
        <Box
          mt={10}
          p={2.5}
          borderRadius={8}
          bg={"black"}
          justifyContent={"center"}
          alignItems={"center"}
          display={"inline-flex"}
          alignSelf={"center"}
        >
          <Flex
            bg={"white"}
            height={18}
            width={18}
            borderRadius={9}
            justify={"center"}
            align={"center"}
            mr={2.5}
          >
            <IconCheckLineBlack />
          </Flex>
          <Text color={"white"} fontWeight={500}>
            {t("Common:copySuccess")}
          </Text>
        </Box>
      </VStack>
    ),
    duration: 1000,
  });

  return {
    showToast: () => {
      if (!toast.isActive(ToastId)) {
        toast({ id: ToastId });
      }
    },
  };
};
