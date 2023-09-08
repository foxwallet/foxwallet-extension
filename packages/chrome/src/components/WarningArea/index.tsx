import React from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { P4 } from "../../common/theme/components/text";

type WarningArea = {
  container?: BoxProps;
  content: string;
};

export const WarningArea = (props: WarningArea) => {
  const { content, container } = props;
  return (
    <Box bg={"red.50"} {...container} borderRadius={"lg"} px={"4"} py={"2"}>
      <P4 color={"red.300"}>*{content}</P4>
    </Box>
  );
};
