import React, { type PropsWithChildren } from "react";
import { Flex, type FlexProps } from "@chakra-ui/react";

export const Body = (props: PropsWithChildren & FlexProps) => {
  const { children, ...rest } = props;
  return (
    <Flex direction={"column"} flex={1} {...rest}>
      {children}
    </Flex>
  );
};
