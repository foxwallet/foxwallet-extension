import {
  Flex,
  useToast,
  Text,
  Box,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { IconCheckLineBlack, IconCloseLineBlack } from "../Icon";
import { useTranslation } from "react-i18next";

const ToastId = "wrong-password-toast";
export const useWrongPasswordToast = () => {
  const { t } = useTranslation();
  const bg = useColorModeValue("black", "white");
  const iconBg = useColorModeValue("white", "black");
  const textColor = useColorModeValue("white", "black");

  const toast = useToast({
    position: "top",
    render: () => (
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
            <IconCloseLineBlack />
          </Flex>
          <Text color={textColor} fontWeight={500}>
            {t("Common:wrongPassword")}
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
