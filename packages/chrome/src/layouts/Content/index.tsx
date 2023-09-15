import React, { type PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";

export const Content = (props: PropsWithChildren) => {
  return (
    <Flex direction={"column"} flex={1} px="4">
      {props.children}
    </Flex>
  );
};
