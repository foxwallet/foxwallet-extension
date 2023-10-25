import { Button, chakra, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { textStyles } from "./text";

export const textAreaTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      display: "flex",
      outline: "none",
      resize: "none",
      borderRadius: "lg",
      backgroundColor: "gray.50",
      paddingX: "3",
      paddingY: "2",
      lineHeight: "6",
      fontSize: "14",
      "::placeholder": {
        color: "gray.300",
      },
    };
  },
});
