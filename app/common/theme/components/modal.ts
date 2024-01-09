import { defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

export const modalTheme = defineStyleConfig({
  baseStyle: (props) => ({
    overlay: {
      opacity: "0.3 !important",
      bg: mode("black", "gray.700")(props),
    },
  }),
});
