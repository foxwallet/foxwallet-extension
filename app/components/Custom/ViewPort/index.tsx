import React, { type PropsWithChildren } from "react";
import { Box } from "@chakra-ui/react";
import { useIsInTab } from "../../../hooks/useTab";
import { POPUP_HEIGHT, POPUP_WIDTH } from "@/common/constants/style";

export const ViewPort = (props: PropsWithChildren) => {
  const isInTab = useIsInTab();

  return (
    <Box
      w={isInTab ? "full" : `${POPUP_WIDTH}px`}
      h={isInTab ? "full" : `${POPUP_HEIGHT}px`}
      {...props}
    />
  );
};
