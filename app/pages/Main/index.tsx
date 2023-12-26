import { Flex, Text, UseTabProps, useTab } from "@chakra-ui/react";
import { useCallback, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabList, TabPanels } from "@chakra-ui/react";
import { WalletTab } from "./WalletTab";
import { SettingTab } from "./SettingTab";
import { useLocation } from "react-router-dom";
import {
  IconSettingSelected,
  IconSettingUnselected,
  IconWalletSelected,
  IconWalletUnselected,
} from "@/components/Custom/Icon";

function MainScreen() {
  const location = useLocation();

  // 获取 URL 中的 Tab 索引
  const tabIndex = parseInt(
    new URLSearchParams(location.search).get("tab") || "0",
  );

  const navigate = useNavigate();
  const handleTabsChange = useCallback((index: number) => {
    navigate(`?tab=${index}`);
  }, []);

  return (
    <Flex flexDirection={"column"} flex={1} alignItems={"stretch"}>
      <Tabs
        variant={"unstyled"}
        flex={1}
        defaultIndex={tabIndex}
        onChange={handleTabsChange}
      >
        <TabPanels h={"100%"}>
          <WalletTab />
          <SettingTab />
        </TabPanels>
        <TabList
          sx={{ position: "sticky" }}
          bottom={0}
          left={0}
          right={0}
          height={59}
          bg={"white"}
          borderTopWidth={1}
          borderColor={"#E6E8EC"}
        >
          <CustomTab
            key={"wallet"}
            selected={<IconWalletSelected />}
            unselected={<IconWalletUnselected />}
          >
            Wallet
          </CustomTab>
          <CustomTab
            key={"setting"}
            selected={<IconSettingSelected />}
            unselected={<IconSettingUnselected />}
          >
            Setting
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
      <Text fontWeight={500} color={"#000"} fontSize={12}>
        {tabProps.children}
      </Text>
    </Flex>
  );
});
