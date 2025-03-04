import {
  Button,
  Flex,
  Image,
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
  IconAllNetworks,
  IconCheckboxSelected,
  IconCheckboxUnselected,
  IconSearch,
  IconEVM,
} from "@/components/Custom/Icon";
import type { ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";
import { useDebounce } from "use-debounce";
import { useSearchNetworks } from "@/hooks/useSearchNetworks";
import { CoinType } from "core/types";

enum AllItemType {
  All,
  EVM,
}

const AllItem = ({
  isAllSelected,
  onSelect,
  type = AllItemType.All,
}: {
  isAllSelected: boolean;
  onSelect: () => void;
  type?: AllItemType;
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      cursor={"pointer"}
      justifyContent="space-between"
      alignItems="center"
      w={"full"}
      h={"44px"}
      pl={2}
      onClick={onSelect}
    >
      <Flex justify={"center"} alignItems="center">
        {type === AllItemType.All ? (
          <IconAllNetworks w={"24px"} h={"24px"} borderRadius={"50px"} />
        ) : (
          <IconEVM w={"24px"} h={"24px"} borderRadius={"50px"} />
        )}
        <Text pl={2}>
          {type === AllItemType.All
            ? t("Wallet:allNetworks")
            : t("Wallet:allEVMNetworks")}
        </Text>
      </Flex>
      {isAllSelected ? (
        <IconCheckboxSelected w={4} h={4} mr={2} />
      ) : (
        <IconCheckboxUnselected w={4} h={4} mr={2} />
      )}
    </Flex>
  );
};

const AddressNetworkItem = ({
  item,
  onSelect,
}: {
  item: ChainBaseConfig & { isSelected: boolean };
  onSelect: (data: ChainBaseConfig) => void;
}) => {
  const language = getCurrLanguage();
  const remark =
    item.chainRemark?.[language] ?? item.chainRemark?.[SupportLanguages.EN];
  const chainName = remark ? `${item.chainName} - ${remark}` : item.chainName;

  return (
    <Flex
      cursor={"pointer"}
      justifyContent="space-between"
      alignItems="center"
      w={"full"}
      h={"44px"}
      pl={2}
      onClick={() => {
        onSelect(item);
      }}
    >
      <Flex justify={"center"} alignItems="center">
        <Image src={item.logo} w={"24px"} h={"24px"} borderRadius={"50px"} />
        <Text pl={2}>{chainName}</Text>
      </Flex>
      {item.isSelected ? (
        <IconCheckboxSelected w={4} h={4} mr={2} />
      ) : (
        <IconCheckboxUnselected w={4} h={4} mr={2} />
      )}
    </Flex>
  );
};

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onSelectChains: (configs: ChainBaseConfig[]) => void;
  supportChains: ChainBaseConfig[];
  selectedUniqueId?: ChainUniqueId[];
}

const SelectContactNetworkDrawer = (props: Props) => {
  const {
    isOpen,
    onCancel,
    onConfirm,
    onSelectChains,
    supportChains,
    selectedUniqueId = [],
  } = props;
  const { t } = useTranslation();
  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);

  const [userSelectedChains, setUserSelectedChains] = useState<
    ChainBaseConfig[]
  >(supportChains.filter((item) => selectedUniqueId.includes(item.uniqueId)));

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const supportChainsWithSelect = useMemo(() => {
    const userSelectedUniqueIds = new Set(
      userSelectedChains.map((item) => item.uniqueId),
    );
    return supportChains.map((item) => {
      const isSelected = userSelectedUniqueIds.has(item.uniqueId);
      return { ...item, isSelected };
    });
  }, [supportChains, userSelectedChains]);

  const { searchRes, searching: loading } = useSearchNetworks(
    searchStr,
    supportChainsWithSelect,
  );

  const displayList = useMemo(() => {
    return debounceSearchStr ? searchRes : supportChainsWithSelect;
  }, [debounceSearchStr, supportChainsWithSelect, searchRes]);

  const onSelectChain = useCallback((data: ChainBaseConfig) => {
    setUserSelectedChains((prev) => {
      const set = new Set(prev.map((item) => item.uniqueId));
      return set.has(data.uniqueId)
        ? prev.filter((id) => id.uniqueId !== data.uniqueId)
        : [...prev, data];
    });
  }, []);

  const isAllSelected = useMemo(() => {
    return supportChains.length === userSelectedChains.length;
  }, [supportChains, userSelectedChains]);

  const selectAll = useCallback(() => {
    setUserSelectedChains(isAllSelected ? [] : supportChains);
  }, [isAllSelected, supportChains]);

  const evmSupportChainsWithSelect = useMemo(() => {
    return supportChainsWithSelect.filter((item) => {
      return item.coinType === CoinType.ETH;
    });
  }, [supportChainsWithSelect]);

  const isEvmAllSelected = useMemo(() => {
    const found = evmSupportChainsWithSelect.filter((item) => {
      return item.isSelected;
    });
    return found.length === evmSupportChainsWithSelect.length;
  }, [evmSupportChainsWithSelect]);

  const selectAllEvm = useCallback(() => {
    if (isEvmAllSelected) {
      const evmUniqueIds = new Set(
        evmSupportChainsWithSelect.map((item) => item.uniqueId),
      );
      const ret = userSelectedChains.filter((item) => {
        return !evmUniqueIds.has(item.uniqueId);
      });
      setUserSelectedChains(ret);
    } else {
      const mergedSet = new Set([
        ...evmSupportChainsWithSelect,
        ...userSelectedChains,
      ]);
      setUserSelectedChains(Array.from(mergedSet));
    }
  }, [evmSupportChainsWithSelect, isEvmAllSelected, userSelectedChains]);

  const onConfirmSelect = useCallback(() => {
    onSelectChains(userSelectedChains);
    onConfirm();
  }, [onConfirm, onSelectChains, userSelectedChains]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Contacts:selectNetwork")}
      body={
        <Flex flexDirection={"column"} h={400}>
          <InputGroup flexDir={"column"} px={0} position={"relative"}>
            <InputLeftElement
              position={"absolute"}
              top={"calc(50% - 13px)"}
              ml={3}
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
          <Flex
            direction={"column"}
            maxH={360}
            overflowY="auto"
            sx={HIDE_SCROLL_BAR_CSS}
          >
            <VStack mt={4} spacing={"10px"}>
              {supportChains.length > 1 && !debounceSearchStr && (
                <AllItem isAllSelected={isAllSelected} onSelect={selectAll} />
              )}
              {evmSupportChainsWithSelect.length > 1 && !debounceSearchStr && (
                <AllItem
                  isAllSelected={isEvmAllSelected}
                  onSelect={selectAllEvm}
                  type={AllItemType.EVM}
                />
              )}
              {displayList.map((item, index) => {
                return (
                  <AddressNetworkItem
                    key={item.uniqueId}
                    item={item}
                    onSelect={(data: ChainBaseConfig) => {
                      onSelectChain(data);
                    }}
                  />
                );
              })}
            </VStack>
          </Flex>
        </Flex>
      }
      footer={
        <Flex justify={"space-between"} flex={1}>
          <Button flex={1} onClick={onConfirmSelect}>
            {t("Common:confirm")}
          </Button>
        </Flex>
      }
    />
  );
};
export const showSelectContactNetworkDrawer = promisifyChooseDialogWrapper(
  SelectContactNetworkDrawer,
);
