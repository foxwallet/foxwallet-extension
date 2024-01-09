import { defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

export const svgIconTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      fill: mode("black", "white")(props),
    };
  },
});
