import { Button, chakra, defineStyleConfig } from "@chakra-ui/react";

export const modalTheme = defineStyleConfig({
  baseStyle: {
    overlay: {
      opacity: "0.3 !important",
      bg: "black",
    },
  },
});
