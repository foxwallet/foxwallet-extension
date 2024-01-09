import { defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const hoverPadding = 1.5;
export const hoverTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      _hover: {
        background: mode("#F5F5F5", "gray.800")(props),
      },
      cursor: "pointer",
    };
  },
  variants: {
    icon: {
      padding: hoverPadding,
      borderRadius: hoverPadding * 10,
    },
    cell: {},
  },
  defaultProps: {
    variant: "icon",
  },
});
