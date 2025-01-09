import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { useTranslation } from "react-i18next";
import {
  IconCloseLine,
  IconSearch,
  IconSettings,
} from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import {
  ChainAssembleMode,
  type ChainDisplayMode,
  type ChainUniqueId,
} from "core/types/ChainUniqueId";
import { NetworkItem } from "@/components/Wallet/NetworkItem";
import { useUserSelectedChains } from "@/hooks/useUserSelectedChains";
import { HeaderMiddleView } from "@/components/Wallet/HeaderMiddleView";
import { useSearchNetworks } from "@/hooks/useSearchNetworks";

export type SingleChainDisplayData = {
  mode: ChainAssembleMode.SINGLE;
  uniqueId: ChainUniqueId;
  popular?: boolean;
} & ChainBaseConfig;

export type ChainDisplayData =
  | { mode: ChainAssembleMode.ALL }
  | SingleChainDisplayData;

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  chainMode: ChainDisplayMode;
  onNetworks: () => void;
  onWallet: () => void;
  onSelectNetwork: (data: ChainDisplayMode) => void;
}

const ChangeNetworkDrawer = (props: Props) => {
  const {
    isOpen,
    onCancel,
    onConfirm,
    title,
    chainMode,
    onNetworks,
    onWallet,
    onSelectNetwork,
  } = props;
  const { t } = useTranslation();
  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);
  const { selectedChains } = useUserSelectedChains();

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const { searchRes, searching: loading } = useSearchNetworks(
    searchStr,
    selectedChains.filter(
      (i) => i.mode === ChainAssembleMode.SINGLE,
    ) as SingleChainDisplayData[],
  );

  const displayList = useMemo(() => {
    return debounceSearchStr ? searchRes : selectedChains;
  }, [debounceSearchStr, selectedChains, searchRes]);

  const onManageNetworks = useCallback(() => {
    onCancel?.();
    onNetworks?.();
  }, [onCancel, onNetworks]);

  const onManageWallet = useCallback(() => {
    onCancel?.();
    onWallet();
  }, [onCancel, onWallet]);

  const onSelect = useCallback(
    (data: ChainDisplayMode) => {
      onCancel?.();
      setTimeout(() => {
        onSelectNetwork(data);
      }, 100);
    },
    [onCancel, onSelectNetwork],
  );

  const renderNetworks = useMemo(() => {
    return (
      <Box overflowY="auto">
        <VStack spacing={"10px"}>
          {displayList.map((item, index) => {
            const key =
              item.mode === ChainAssembleMode.ALL
                ? "ChainAssembleMode.ALL"
                : item.uniqueId;

            const isSelected =
              chainMode.mode === ChainAssembleMode.SINGLE
                ? item.mode === ChainAssembleMode.ALL
                  ? false
                  : item.uniqueId === chainMode.uniqueId
                : item.mode === ChainAssembleMode.ALL;
            return (
              <NetworkItem
                item={item}
                onSelectNetwork={onSelect}
                isSelected={isSelected}
                key={key}
              />
            );
          })}
        </VStack>
      </Box>
    );
  }, [chainMode, displayList, onSelect]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Networks:manageNetworks")}
      header={
        <Flex
          alignItems={"center"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          w={"full"}
          position={"relative"}
        >
          <Flex
            cursor={"pointer"}
            alignItems={"center"}
            borderRadius={"11px"}
            borderColor={"black"}
            borderWidth={"1px"}
            h={"22px"}
            px={1}
            onClick={onManageNetworks}
          >
            <IconSettings />
            <Text ml={1} fontSize={12}>
              {t("Networks:title")}
            </Text>
          </Flex>
          <HeaderMiddleView onClick={onManageWallet} title={title} />
          <IconCloseLine w={6} h={6} cursor={"pointer"} onClick={onCancel} />
        </Flex>
      }
      body={
        <Flex flexDirection={"column"} h={450}>
          <InputGroup flexDir={"column"} position={"relative"} pb={4}>
            <InputLeftElement
              position={"absolute"}
              top={"calc(50% - 20px)"}
              ml={2}
            >
              <IconSearch w={"26px"} h={"26px"} />
            </InputLeftElement>
            <Input
              alignSelf={"stretch"}
              bg={"gray.50"}
              value={searchStr}
              onChange={onKeywordChange}
              placeholder={t("Contacts:networkName")}
              pl={10}
              py={2}
            />
          </InputGroup>
          {renderNetworks}
        </Flex>
      }
    />
  );
};

export const showChangeNetworkDrawer =
  promisifyChooseDialogWrapper(ChangeNetworkDrawer);
