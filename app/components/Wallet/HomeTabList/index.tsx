import { Tab, TabIndicator, TabList, TabPanels, Tabs } from "@chakra-ui/react";
import { AssetList } from "../AssetList";
import { useTranslation } from "react-i18next";

export const HomeTabList = () => {
  const { t } = useTranslation();
  return (
    <Tabs variant={"unstyled"} py={3}>
      <TabList px={5}>
        <Tab mr={6}>{t("Wallet:tabAsset")}</Tab>
      </TabList>
      <TabIndicator height="2px" bg="black" borderRadius="1px" />
      <TabPanels maxH={258} overflowY="auto" pt={2.5}>
        <AssetList />
      </TabPanels>
    </Tabs>
  );
};
