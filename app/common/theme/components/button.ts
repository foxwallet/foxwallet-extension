import { Button, chakra, defineStyleConfig, propNames } from "@chakra-ui/react";
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

      if (c === "normal") {
        return {
          bg: `white`,
          color: "black",
          border: "1px solid",
          borderColor: "gray.100",
          _disabled: {
            bg: "gray.300",
            cursor: "not-allowed",
          },
        };
      }

      if (c === "secondary") {
        return {
          bg: `white`,
          color: "black",
          borderColor: "black",
          borderWidth: "1px",
          borderStyle: "solid",
          _disabled: {
            bg: "gray.300",
            cursor: "not-allowed",
          },
        };
      }

      if (c === "menu") {
        return {
          bg: mode("white", "black")(props),
          color: mode("black", "white")(props),
          borderColor: mode("black", "#777E90")(props),
          borderWidth: "1px",
          borderStyle: "solid",
          _disabled: {
            bg: "gray.300",
            cursor: "not-allowed",
          },
        };
      }

      return {
        bg: mode("black", "green.500")(props),
        color: mode("green.500", "black")(props),
        _hover: {
          bg: `${c}.600`,
        },
        _active: {
          bg: `${c}.700`,
        },
        _disabled: {
          opacity: mode(1, 0.5)(props),
          bg: mode("gray.500", "green.500")(props),
          cursor: "not-allowed",
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
