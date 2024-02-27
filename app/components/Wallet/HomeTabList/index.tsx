import {
  Box,
  Button,
  ButtonProps,
  Tab,
  TabIndicator,
  TabList,
  TabPanels,
  Tabs,
  useMultiStyleConfig,
  useTab,
} from "@chakra-ui/react";
import { AssetList } from "../AssetList";
import { useTranslation } from "react-i18next";
import { useState, forwardRef, PropsWithChildren } from "react";

const CustomTab = forwardRef(
  (props: PropsWithChildren & ButtonProps, ref: any) => {
    const tabProps = useTab({ ...props, ref });
    const isSelected = !!tabProps["aria-selected"];

    const styles = useMultiStyleConfig("Tabs", tabProps);

    return (
      <Button
        __css={styles.tab}
        {...tabProps}
        borderBottom={isSelected ? "2px solid" : undefined}
        borderRadius={"1px"}
      >
        {tabProps.children}
      </Button>
    );
  },
);

export const HomeTabList = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Tabs
      variant={"unstyled"}
      position="relative"
      py={3}
      index={tabIndex}
      onChange={(index) => setTabIndex(index)}
    >
      <TabList px={5}>
        <CustomTab mr={6}>{t("Wallet:tabAsset")}</CustomTab>
      </TabList>
      {/* <TabIndicator height="2px" bg="black" borderRadius="1px" /> */}
      <TabPanels maxH={258} overflowY="auto">
        <AssetList />
      </TabPanels>
    </Tabs>
  );
};
