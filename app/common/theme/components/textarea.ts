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
      borderWidth: "1.5px",
      borderColor: mode("gray.100", "white")(props),
      "::placeholder": {
        color: mode("gray.600", "gray.300")(props),
      },
      _focus: {
        borderColor: mode("black", "white")(props),
      },
    };
  },
});
