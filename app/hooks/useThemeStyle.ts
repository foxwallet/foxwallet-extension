import { useColorModeValue } from "@chakra-ui/react";

export const useThemeStyle = () => {
  const borderColor = useColorModeValue("gray.50", "#777E90");
  const selectedBorderColor = useColorModeValue("black", "white");

  return {
    borderColor,
    selectedBorderColor,
  };
};
