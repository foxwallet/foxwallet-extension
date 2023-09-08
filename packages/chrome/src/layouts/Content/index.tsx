import React, { PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";

export const Content = (props: PropsWithChildren) => {
  return (
    <Flex direction={"column"} flex={1} px="2">
      {props.children}
    </Flex>
  );
};
