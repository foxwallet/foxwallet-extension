import {
  Box,
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
import { IconCopy, IconSearch, IconMore } from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import Hover from "@/components/Custom/Hover";
import { useChainMode } from "@/hooks/useChainMode";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { useSearchNetworks } from "@/hooks/useSearchNetworks";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export type ChainItemProps = {
  item: ChainBaseConfig;
  onCopyAddress: (acc: OneMatchAccount) => void;
  hasMore?: boolean;
  onMore?: (config: ChainBaseConfig) => void;
};

export const CopyAddressChainItem = (props: ChainItemProps) => {
  const { onCopyAddress, item, hasMore = false, onMore } = props;
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const selectedAccount = getMatchAccountsWithUniqueId(item.uniqueId)[0];
  return (
    <Flex
      w={"full"}
      h={"60px"}
      align={"center"}
      borderRadius={"4px"}
      borderWidth={"1px"}
      borderColor={"#e6e8ec"}
    >
      <Image
        src={item.logo}
        w={"24px"}
        h={"24px"}
        borderRadius={"50px"}
        ml={2}
        mr={2}
      />
      <Flex
        direction={"column"}
        align={"start"}
        w={hasMore ? "82%" : "full"}
        h={"full"}
        justifyContent={"center"}
        // bg={"yellow"}
      >
        <Text fontSize={"small"}>{item.chainName}</Text>
        <Hover
          onClick={() => {
            onCopyAddress(selectedAccount);
          }}
          bg={"#f9f9f9"}
          borderRadius={"5px"}
        >
          <Flex dir={"row"} align={"center"} justify={"center"} marginX={1}>
            <Flex
              maxW={hasMore ? 230 : 300}
              noOfLines={1}
              fontSize={11}
              color={"#777E90"}
              w={"full"}
            >
              <MiddleEllipsisText
                text={selectedAccount.account.address}
                width={hasMore ? 230 : 260}
              />
            </Flex>
            <IconCopy w={3} h={3} ml={1} />
          </Flex>
        </Hover>
      </Flex>
      {hasMore && (
        <Hover
          p={1}
          onClick={() => {
            onMore?.(item);
          }}
        >
          <IconMore />
        </Hover>
      )}
    </Flex>
  );
};

const CopyAddressDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm } = props;
  const { t } = useTranslation();
  const { showToast } = useCopyToast();
  const { availableChains } = useChainMode();
  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const { searchRes, searching: loading } = useSearchNetworks(
    searchStr,
    availableChains,
  );

  const displayChains = useMemo(() => {
    return debounceSearchStr ? searchRes : availableChains;
  }, [debounceSearchStr, availableChains, searchRes]);

  const onCopyAddress = useCallback(
    async (data: OneMatchAccount) => {
      onCancel?.();
      await navigator.clipboard.writeText(data.account.address);
      showToast();
    },
    [onCancel, showToast],
  );

  const renderNetworks = useMemo(() => {
    return (
      <Box overflowY="auto" sx={HIDE_SCROLL_BAR_CSS}>
        <VStack spacing={"10px"}>
          {displayChains.map((item, index) => {
            return (
              <CopyAddressChainItem
                item={item}
                onCopyAddress={onCopyAddress}
                key={item.uniqueId}
                // hasMore={true}
              />
            );
          })}
        </VStack>
      </Box>
    );
  }, [displayChains, onCopyAddress]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Contacts:selectNetwork")}
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

export const showCopyAddressDrawer =
  promisifyChooseDialogWrapper(CopyAddressDrawer);
