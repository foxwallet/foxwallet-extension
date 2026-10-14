import React, { type PropsWithChildren } from "react";
import { Box } from "@chakra-ui/react";
import { useIsInTab } from "../../../hooks/useTab";
import { POPUP_HEIGHT, POPUP_WIDTH } from "@/common/constants/style";
import { isSidePanel } from "@/common/utils/walletUI";

interface ViewPortProps extends PropsWithChildren {
  fill?: boolean;
}

export const ViewPort = ({ children, fill = true }: ViewPortProps) => {
  const isInTab = useIsInTab();
  const fluid =
    isSidePanel() ||
    isInTab ||
    window.location.pathname === "/notification.html";

  return (
    <Box
      width="full"
      minW={fluid ? 0 : `${POPUP_WIDTH}px`}
      minH={fill ? (fluid ? "100dvh" : `${POPUP_HEIGHT}px`) : undefined}
      display={"flex"}
      flexDirection={"column"}
    >
      {children}
    </Box>
  );
};
