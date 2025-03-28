import { useColorModeValue } from "@chakra-ui/react";

export const useThemeStyle = () => {
  const borderColor = useColorModeValue("gray.50", "#777E90");
  const selectedBorderColor = useColorModeValue("black", "white");
  const backgroundColor = useColorModeValue("white", "gray.900");
  const deleteColor = useColorModeValue("#EF466F", "#EF466F");

  return {
    borderColor,
    selectedBorderColor,
    backgroundColor,
    deleteColor,
  };
};
