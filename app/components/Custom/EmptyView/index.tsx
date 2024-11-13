import { Text, VStack } from "@chakra-ui/react";
import { IconEmptyTxPlaceholder } from "@/components/Custom/Icon";
import type React from "react";

export const EmptyView = ({
  searching,
  text,
}: {
  searching: boolean;
  text?: string;
}) => {
  if (searching) {
    return null;
  }
  return (
    <VStack spacing={4} justify={"center"}>
      <IconEmptyTxPlaceholder />
      {text && <Text>{text}</Text>}
    </VStack>
  );
};
