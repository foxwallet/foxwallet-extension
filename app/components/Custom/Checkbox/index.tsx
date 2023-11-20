import React, { type PropsWithChildren, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { Box, Flex, type FlexProps } from "@chakra-ui/react";
import { IconCheckCircle } from "../Icon";

export type CheckboxProps = {
  container?: FlexProps;
  onStatusChange: (checked: boolean) => void;
} & PropsWithChildren;

export function BaseCheckbox(props: CheckboxProps) {
  const { onStatusChange, children, container } = props;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    onStatusChange(checked);
  }, [checked, onStatusChange]);

  return (
    <Flex
      alignItems={"center"}
      {...container}
      onClick={() => {
        setChecked((curr) => !curr);
      }}
      cursor={"pointer"}
    >
      <Box w="4" h="4" mr="1">
        <Box
          w="4"
          h="4"
          borderRadius={"50%"}
          borderColor={checked ? "transparent" : "orange.500"}
          borderWidth={"2px"}
          position={"absolute"}
        />
        <Transition
          show={checked}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <IconCheckCircle w="4" h="4" />
        </Transition>
      </Box>
      {children}
    </Flex>
  );
}

export default BaseCheckbox;
