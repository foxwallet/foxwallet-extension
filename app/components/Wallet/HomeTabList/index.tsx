import {
  Box,
  Button,
  type ButtonProps,
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
import {
  useState,
  forwardRef,
  type PropsWithChildren,
  useCallback,
} from "react";
import { IconAddCircle } from "@/components/Custom/Icon";
import { useNavigate } from "react-router-dom";
import { useChainMode } from "@/hooks/useChainMode";
import { ChainAssembleMode } from "core/types/ChainUniqueId";

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
CustomTab.displayName = "CustomTab";

export const HomeTabList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chainMode, availableChainUniqueIds } = useChainMode();

  const [tabIndex, setTabIndex] = useState(0);

  const onAddToken = useCallback(() => {
    if (chainMode.mode === ChainAssembleMode.SINGLE) {
      const uniqueId = availableChainUniqueIds[0];
      navigate(`/add_token/${uniqueId}`);
    } else {
    }
  }, [availableChainUniqueIds, chainMode.mode, navigate]);

  return (
    <Tabs
      variant={"unstyled"}
      position="relative"
      index={tabIndex}
      onChange={(index) => {
        setTabIndex(index);
      }}
      display={"flex"}
      flexDir={"column"}
      flex={1}
      overflowY={"hidden"}
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
            onClick={onAddToken}
          />
        </Flex>
      </Flex>
      <AssetList />
    </Tabs>
  );
};
