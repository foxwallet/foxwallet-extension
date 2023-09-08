import { Button, chakra, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { textStyles } from "./text";

export const buttonTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      display: "flex",
      alignIitems: "center",
      justifyContent: "center",
      outline: "none",
      border: "none",
      borderRadius: "lg",
      textAlign: "center",
      fontWeight: "bold",
      _active: {
        transform: "scale(0.975)",
      },
      cursor: "pointer",
      _disabled: {
        pointerEvents: "none",
      },
      _focusVisible: {
        boxShadow: mode("outlineAccent", "outline")(props),
      },
    };
  },
  sizes: {
    auto: {},
    "3xs": {
      ...textStyles.B3,
      px: "1.5",
      py: 0,
    },
    "2xs": {
      ...textStyles.B3,
      minHeight: 8,
      px: 3,
      py: 1,
    },
    xs: {
      ...textStyles.B3,
      minHeight: 9,
      px: 4,
      py: 1,
    },
    sm: {
      ...textStyles.B3,
      minHeight: 10,
      px: 5,
      py: 2,
    },
    md: {
      ...textStyles.B2,
      minHeight: 12,
      px: 6,
      py: 2,
    },
    lg: {
      ...textStyles.B1,
      minHeight: 14,
      px: 8,
      py: 2,
    },
  },
  variants: {
    outline: {},
    solid: (props) => {
      const { colorScheme: c } = props;

      /** same for dark or light mode */
      return {
        bg: `orange.400`,
        color: "white",
        _hover: {
          bg: `${c}.600`,
        },
        _active: {
          bg: `${c}.700`,
        },
      };
    },
  },
  defaultProps: {
    size: "md",
    variant: "solid",
    colorScheme: "primary",
  },
});
