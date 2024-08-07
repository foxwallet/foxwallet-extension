import { type ThemeConfig, extendBaseTheme } from "@chakra-ui/react";
import { buttonTheme } from "./components/button";
import { semanticTokens, colors } from "./color";
import { shadows } from "./shadows";
import { sizes } from "./size";
import {
  fontSize,
  fontWeights,
  fonts,
  letterSpacings,
  lineHeights,
} from "./font";
import { space } from "./space";
import { zIndices } from "./zIndices";
import { radii } from "./borderRadius";
import { inputTheme } from "./components/input";
import { checkBoxTheme } from "./components/checkbox";
import { modalTheme } from "./components/modal";
import { textAreaTheme } from "./components/textarea";
import { hoverTheme } from "./components/hover";
import { svgIconTheme } from "./components/svg";
import { dividerTheme } from "./components/divider";

export const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendBaseTheme({
  config,
  semanticTokens,
  styles: {
    global: {
      "html, body": {
        color: "text",
        bg: "bg",
      },
      "*::-webkit-scrollbar": {
        width: "8px",
      },
      "*::-webkit-scrollbar-track": {
        background: "gray.50",
        borderRadius: "8px",
      },
      "*::-webkit-scrollbar-thumb": {
        background: "green.900",
        borderRadius: "8px",
      },
      "*::-webkit-scrollbar-thumb:hover": {
        background: "gray.600",
      },
    },
  },
  colors,
  fontSize,
  fonts,
  fontWeights,
  lineHeights,
  letterSpacings,
  sizes,
  shadows,
  space,
  zIndices,
  radii,
  components: {
    Button: buttonTheme,
    Input: inputTheme,
    Checkbox: checkBoxTheme,
    Modal: modalTheme,
    Textarea: textAreaTheme,
    Hover: hoverTheme,
    SvgIcon: svgIconTheme,
    Divider: dividerTheme,
  },
});
