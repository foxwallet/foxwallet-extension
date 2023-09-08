import React, { PropsWithChildren } from "react";
import { Box } from "@chakra-ui/react";
import { useIsInTab } from "../../hooks/useTab";

export const ViewPort = (props: PropsWithChildren) => {
  const isInTab = useIsInTab();

  return (
    <Box
      w={isInTab ? "full" : "360px"}
      h={isInTab ? "full" : "600px"}
      {...props}
    />
  );
};
