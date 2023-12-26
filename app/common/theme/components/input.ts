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
      bg: mode("white", "black")(props),
      borderStyle: "solid",
      borderWidth: "2px",
      borderColor: mode("black", "white")(props),
      outline: "none",
      _placeholder: {
        color: mode("gray.300", "gray.400")(props),
        fontWeight: "bold",
      },
      _invalid: {
        border: "2px solid",
        borderColor: "red.400",
      },
      _focus: {
        bg: mode("gray.50", "gray.800")(props),
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
