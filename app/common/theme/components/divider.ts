import { defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

export const dividerTheme = defineStyleConfig({
  baseStyle: (props) => ({
    bgColor: mode("gray.50", "#777E90")(props),
  }),
});
