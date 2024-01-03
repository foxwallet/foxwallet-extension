import React, { type PropsWithChildren } from "react";
import { Flex, FlexProps } from "@chakra-ui/react";

export const Content = (props: PropsWithChildren & FlexProps) => {
  const { children, ...rest } = props;

  return (
    <Flex direction={"column"} flex={1} px={5} py={4} {...rest}>
      {props.children}
    </Flex>
  );
};
