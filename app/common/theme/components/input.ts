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
      borderWidth: "1.6px",
      borderColor: mode("gray.50", "#777E90")(props),
      outline: "none",
      _placeholder: {
        color: mode("gray.500", "gray.400")(props),
      },
      _invalid: {
        borderColor: "red.400",
      },
      _focus: {
        borderColor: mode("black", "white")(props),
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
