import React, { type PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";

export const Body = (props: PropsWithChildren) => {
  return (
    <Flex direction={"column"} flex={1}>
      {props.children}
    </Flex>
  );
};
