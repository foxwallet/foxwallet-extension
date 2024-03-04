import {
  Box,
  Button,
  ButtonProps,
  Flex,
  IconButton,
  Image,
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
import { IconAddCircle } from "@/components/Custom/Icon";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Tabs
      variant={"unstyled"}
      position="relative"
      py={3}
      index={tabIndex}
      onChange={(index) => setTabIndex(index)}
    >
      <Flex px={5}>
        <TabList flex={1}>
          <CustomTab mr={6}>{t("Wallet:tabAsset")}</CustomTab>
        </TabList>
        <Flex>
          <IconButton
            aria-label="Add token"
            icon={<IconAddCircle />}
            colorScheme="whiteAlpha"
            bg={"white"}
            size={"xs"}
            onClick={() => navigate("/add_token")}
          />
        </Flex>
      </Flex>
      <AssetList />
    </Tabs>
  );
};
