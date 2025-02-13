import {
  Button,
  type ButtonProps,
  Flex,
  IconButton,
  TabList,
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
import {
  ChainAssembleMode,
  type ChainDisplayMode,
} from "core/types/ChainUniqueId";
import {
  showChangeNetworkDrawer,
  type SingleChainDisplayData,
} from "@/components/Wallet/ChangeNetworkDrawer";
import { type TokenV2 } from "core/types/Token";

const CustomTab = forwardRef(
  (props: PropsWithChildren & ButtonProps, ref: any) => {
    const tabProps = useTab({ ...props, ref });
    const isSelected = tabProps["aria-selected"];

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

export const HomeTabList = ({ assets }: { assets: TokenV2[] | undefined }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chainMode, availableChainUniqueIds } = useChainMode();

  const [tabIndex, setTabIndex] = useState(0);

  const onAddToken = useCallback(async () => {
    if (chainMode.mode === ChainAssembleMode.SINGLE) {
      const uniqueId = availableChainUniqueIds[0];
      navigate(`/add_token/${uniqueId}`);
    } else {
      await showChangeNetworkDrawer({
        title: t("Networks:selectNetwork"),
        chainMode,
        onWallet: () => {
          navigate("/manage_wallet");
        },
        onNetworks: () => {
          navigate("/networks");
        },
        onSelectNetwork: (data: ChainDisplayMode) => {
          navigate(`/add_token/${(data as SingleChainDisplayData).uniqueId}`);
        },
        isForAddToken: true,
      });
    }
  }, [availableChainUniqueIds, chainMode, navigate, t]);

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
      <AssetList assets={assets} />
    </Tabs>
  );
};
