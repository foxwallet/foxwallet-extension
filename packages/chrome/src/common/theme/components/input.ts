import { inputAnatomy as parts } from "@chakra-ui/anatomy";
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/styled-system";
import { mode } from "@chakra-ui/theme-tools";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

export const baseStyle = definePartsStyle({
  field: {},
});

export const variantFilled = definePartsStyle((props) => {
  return {
    field: {
      bg: mode("gray.50", "gray.800")(props),
      border: "none",
      _placeholder: {
        color: mode("gray.300", "gray.400")(props),
        fontWeight: "bold",
      },
      _hover: {
        bg: mode("gray.100", "gray.700")(props),
      },
      _invalid: {
        boxShadow: "error",
        _focusVisible: {
          boxShadow: mode("outlineError", "error")(props),
        },
      },
      _focusVisible: {
        bg: mode("white", "gray.700")(props),
      },
      _focus: {
        outline: "1px solid",
        outlineColor: "orange.500",
      },
    },
  };
});

const variants = {
  filled: variantFilled,
};

export const sizes = {
  md: defineStyle({
    px: "4",
    py: "3",
    fontSize: "base",
    fontWeight: "semibold",
    borderRadius: "lg",
    minHeight: "10",
  }),
};

const partsStyleSizes = {
  md: definePartsStyle({
    field: sizes.md,
    addon: sizes.md,
  }),
};

export const inputTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes: partsStyleSizes,
  defaultProps: {
    size: "md",
    variant: "filled",
  },
});
