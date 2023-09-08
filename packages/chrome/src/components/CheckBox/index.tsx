import { Checkbox, CheckboxProps } from "@chakra-ui/react";
import React from "react";

export const BaseCheckBox = (props: CheckboxProps) => {
  return <Checkbox {...props} size="md"></Checkbox>;
};
