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
import { useMemo, useCallback, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { useTranslation } from "react-i18next";
import {
  IconAllNetworks,
  IconCheckboxSelected,
  IconCheckboxUnselected,
  IconSearch,
} from "@/components/Custom/Icon";
import type { ChainBaseConfig } from "core/types/ChainBaseConfig";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";

const AllItem = ({
  isAllSelected,
  onSelect,
}: {
  isAllSelected: boolean;
  onSelect: () => void;
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
        <IconAllNetworks w={"24px"} h={"24px"} borderRadius={"50px"} />
        <Text pl={2}>{t("Wallet:allNetworks")}</Text>
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

  const selectedAll = useCallback(() => {
    setUserSelectedChains(isAllSelected ? [] : supportChains);
  }, [isAllSelected, supportChains]);

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
          <VStack mt={4} spacing={"10px"}>
            {supportChainsWithSelect.map((item, index) => {
              return (
                <>
                  {index === 0 && supportChains.length > 1 && (
                    <AllItem
                      isAllSelected={isAllSelected}
                      onSelect={selectedAll}
                    />
                  )}
                  <AddressNetworkItem
                    key={item.uniqueId}
                    item={item}
                    onSelect={(data: ChainBaseConfig) => {
                      onSelectChain(data);
                    }}
                  />
                </>
              );
            })}
          </VStack>
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
