import { Flex, Text, useTab, Tabs, TabList, TabPanels } from "@chakra-ui/react";
import { useCallback, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WalletTab } from "./WalletTab";
import { MeTab } from "./MeTab";
import {
  IconMeSelected,
  IconMeUnselected,
  IconWalletSelected,
  IconWalletUnselected,
} from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { useThemeStyle } from "@/hooks/useThemeStyle";

function MainScreen() {
  const location = useLocation();
  const { t } = useTranslation();

  // 获取 URL 中的 Tab 索引
  const tabIndex = parseInt(
    new URLSearchParams(location.search).get("tab") ?? "0",
  );

  const navigate = useNavigate();
  const handleTabsChange = useCallback(
    (index: number) => {
      navigate(`?tab=${index}`);
    },
    [navigate],
  );

  const { borderColor, backgroundColor } = useThemeStyle();

  return (
    <Flex flexDirection={"column"} flex={1} alignItems={"stretch"}>
      <Tabs
        variant={"unstyled"}
        flex={1}
        defaultIndex={tabIndex}
        onChange={handleTabsChange}
      >
        <TabPanels h={"100vh"}>
          <WalletTab />
          <MeTab />
        </TabPanels>
        <TabList
          sx={{ position: "sticky" }}
          bottom={0}
          left={0}
          right={0}
          height={"60px"}
          borderTopWidth={1}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        >
          <CustomTab
            key={"wallet"}
            selected={<IconWalletSelected />}
            unselected={<IconWalletUnselected />}
          >
            {t("Wallet:title")}
          </CustomTab>
          <CustomTab
            key={"me"}
            selected={<IconMeSelected />}
            unselected={<IconMeUnselected />}
          >
            {t("Me:title")}
          </CustomTab>
        </TabList>
      </Tabs>
    </Flex>
  );
}

export default MainScreen;

const CustomTab = forwardRef<any, any>((props, ref) => {
  const tabProps: any = useTab({ ...props, ref });
  const { selected, unselected } = tabProps;
  const isSelected = !!tabProps["aria-selected"];

  return (
    <Flex
      {...tabProps}
      flex={1}
      direction={"column"}
      align={"center"}
      justify={"center"}
      as={"button"}
    >
      {isSelected ? selected : unselected}
      <Text fontWeight={500} fontSize={12}>
        {tabProps.children}
      </Text>
    </Flex>
  );
});
CustomTab.displayName = "CustomTab";
