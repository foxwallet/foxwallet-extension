import { pxToRem } from "../utils/size";

export const fontWeights = {
  light: "300",
  normal: "400",
  semibold: "500",
  bold: "600",
  extrabold: "700",
};

export const fonts = {
  heading: `'Poppins', sans-serif`,
  body: `'Poppins', sans-serif`,
  mono: `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`,
};

export const fontSize = {
  "3xs": pxToRem(17),
  "2xs": pxToRem(12),
  xs: pxToRem(13),
  sm: pxToRem(14),
  base: pxToRem(16),
  lg: pxToRem(18),
  xl: pxToRem(20),
  "2xl": pxToRem(24),
  "3xl": pxToRem(28),
  "4xl": pxToRem(32),
  "5xl": pxToRem(40),
  "6xl": pxToRem(72),
  "10xl": pxToRem(80),
};

export const letterSpacings = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
};

export const lineHeights = {
  normal: "normal",
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
  taller: "2",
  "3": ".75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "7": "1.75rem",
  "8": "2rem",
  "9": "2.25rem",
  "10": "2.5rem",
  "12": pxToRem(48),
  "14": pxToRem(56),
  "16": pxToRem(64),
  "17": pxToRem(68),
  "18": pxToRem(72),
  "24": pxToRem(96),
};
