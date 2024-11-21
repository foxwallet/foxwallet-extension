import type React from "react";
import { IconChevronRight } from "@/components/Custom/Icon";
import { Flex, Text } from "@chakra-ui/react";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  noNext?: boolean;
  onPress: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  noNext,
  onPress,
}) => {
  return (
    <Flex
      align={"center"}
      justify={"space-between"}
      py={2.5}
      mb={2.5}
      cursor={"pointer"}
      onClick={onPress}
    >
      <Flex align={"center"} justify={"flex-start"}>
        {icon}
        <Text fontSize={14} fontWeight={500} ml={2.5}>
          {title}
        </Text>
      </Flex>
      <Flex align={"center"}>
        {!!subtitle && (
          <Text mr={2.5} color={"#777E90"} fontSize={12} fontWeight={500}>
            {subtitle}
          </Text>
        )}
        {!noNext && <IconChevronRight w={4} h={4} />}
      </Flex>
    </Flex>
  );
};

export default SettingItem;
