import { Flex, Text } from "@chakra-ui/react";
import { IconArrowRight, IconCopy } from "@/components/Custom/Icon";
import type React from "react";

export interface HeaderMiddleViewProps {
  onClick: () => void;
  title: string;
  showArrow?: boolean;
  showCopy?: boolean;
  onCopy?: () => void;
}

export const HeaderMiddleView = (props: HeaderMiddleViewProps) => {
  const { onClick, title, showArrow = true, showCopy = false, onCopy } = props;
  return (
    <Flex
      cursor={"pointer"}
      onClick={onClick}
      flexDirection={"row"}
      align={"center"}
      bg={"#EBECEB"}
      minH={"24px"}
      pr={showArrow || showCopy ? 0 : 2}
      pl={2}
      borderRadius={"5px"}
      position={"absolute"}
      left={"50%"}
      transform={"translateX(-50%)"}
    >
      <Text
        fontSize={12}
        lineHeight={4}
        fontWeight={500}
        maxW={100}
        noOfLines={1}
      >
        {title}
      </Text>
      {showArrow && <IconArrowRight w={18} h={18} />}
      {showCopy && (
        <Flex
          ml={1}
          padding={"5px"}
          onClick={(event) => {
            event.stopPropagation();
            onCopy?.();
          }}
        >
          <IconCopy w={3} h={3} />
        </Flex>
      )}
    </Flex>
  );
};