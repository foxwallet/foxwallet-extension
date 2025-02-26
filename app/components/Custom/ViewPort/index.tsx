import React, { type PropsWithChildren } from "react";
import { Box } from "@chakra-ui/react";
import { useIsInTab } from "../../../hooks/useTab";
import { POPUP_HEIGHT, POPUP_WIDTH } from "@/common/constants/style";

export const ViewPort = (props: PropsWithChildren) => {
  const isInTab = useIsInTab();

  return (
    <Box
      minW={isInTab ? "full" : `${POPUP_WIDTH}px`}
      minH={isInTab ? "full" : `${POPUP_HEIGHT}px`}
      display={"flex"}
      flexDirection={"column"}
      {...props}
    />
  );
};
