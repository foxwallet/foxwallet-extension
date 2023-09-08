import React from "react";
import { Button, chakra, defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { textStyles } from "./text";
import { createIcon, Box } from "@chakra-ui/react";
import IconChecked from "@/common/assets/image/icon_checked.svg";

// 创建一个新的对勾图标
const CustomCheckIcon = createIcon({
  displayName: "CustomCheckIcon",
  viewBox: "0 0 16 16",
  path: (
    <path
      fill="orange.500"
      d={
        "M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5ZM12.4571 6.45711C12.8476 6.06658 12.8476 5.43342 12.4571 5.04289C12.0666 4.65237 11.4334 4.65237 11.0429 5.04289L7.25 8.83579L5.70711 7.29289C5.31658 6.90237 4.68342 6.90237 4.29289 7.29289C3.90237 7.68342 3.90237 8.31658 4.29289 8.70711L6.54289 10.9571C6.93342 11.3476 7.56658 11.3476 7.95711 10.9571L12.4571 6.45711Z"
      }
    />
  ),
});

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
