import { Button, chakra, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { textStyles } from "./text";

export const textAreaTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      display: "flex",
      outline: "none",
      resize: "none",
      paddingX: "3",
      paddingY: "2",
      lineHeight: "6",
      fontSize: "14",
      borderRadius: "lg",
      borderStyle: "solid",
      borderWidth: "2px",
      borderColor: mode("black", "white")(props),
      "::placeholder": {
        color: mode("gray.600", "gray.300")(props),
      },
    };
  },
});
