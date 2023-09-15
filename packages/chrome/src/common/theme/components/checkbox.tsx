import React from "react";
import {
  Button,
  chakra,
  defineStyleConfig,
  createIcon,
  Box,
} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { textStyles } from "./text";

export const checkBoxTheme = defineStyleConfig({
  baseStyle: (props) => {
    return {
      control: {
        borderRadius: "50%",
        borderColor: "orange.500",
        borderWidth: "2px",
      },
    };
  },
  sizes: {
    md: {
      control: {
        w: 3.5,
        h: 3.5,
        _checked: {
          icon: {
            w: 0.5,
            h: 0.5,
          },
        },
      },
    },
  },
  variants: {
    custom: {
      control: {
        borderRadius: "50%",
        borderColor: "orange.500",
        _checked: {
          bg: "orange.500",
          borderColor: "orange.500",
          p: "1",
          color: "white",
          _before: {
            content: '""',
            display: "inline-block",
            width: "100%",
            height: "100%",
            bg: "orange.500",
            borderRadius: "50%",
          },
        },
        _indeterminate: {
          bg: "orange.500",
          borderColor: "orange.500",
          color: "white",
        },
      },
      label: {
        _disabled: {
          opacity: 0.4,
        },
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "custom",
  },
});
