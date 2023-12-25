import { Tab, TabIndicator, TabList, TabPanels, Tabs } from "@chakra-ui/react";
import { AssetList } from "../AssetList";

export const HomeTabList = () => {
  return (
    <Tabs variant={"unstyled"} px={5} py={3}>
      <TabList>
        <Tab mr={6}>Asset</Tab>
      </TabList>
      <TabIndicator height="2px" bg="black" borderRadius="1px" />
      <TabPanels
        maxH={258}
        overflowY="auto"
        sx={{
          scrollbarWidth: "none",
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
        pt={2.5}
      >
        <AssetList />
      </TabPanels>
    </Tabs>
  );
};
