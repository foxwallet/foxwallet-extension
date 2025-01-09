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
import { IconCopy, IconSearch } from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import Hover from "@/components/Custom/Hover";
import { useChainMode } from "@/hooks/useChainMode";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { useSearchNetworks } from "@/hooks/useSearchNetworks";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CopyAddressDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm } = props;
  const { t } = useTranslation();
  const { showToast } = useCopyToast();
  const { availableChains } = useChainMode();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
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
      <Box overflowY="auto">
        <VStack spacing={"10px"}>
          {displayChains.map((item, index) => {
            const selectedAccount = getMatchAccountsWithUniqueId(
              item.uniqueId,
            )[0];
            return (
              <Flex
                w={"full"}
                h={"60px"}
                key={index}
                align={"center"}
                cursor={"pointer"}
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
                  w={"full"}
                  h={"full"}
                  justifyContent={"center"}
                >
                  <Text fontSize={"small"}>{item.chainName}</Text>
                  <Hover
                    onClick={() => {
                      onCopyAddress(selectedAccount);
                    }}
                    bg={"#f9f9f9"}
                    borderRadius={"5px"}
                  >
                    <Flex
                      dir={"row"}
                      align={"center"}
                      justify={"center"}
                      marginX={1}
                    >
                      <Flex
                        maxW={300}
                        noOfLines={1}
                        fontSize={11}
                        color={"#777E90"}
                        w={"full"}
                      >
                        <MiddleEllipsisText
                          text={selectedAccount.account.address}
                          width={260}
                        />
                      </Flex>
                      <IconCopy w={3} h={3} ml={1} />
                    </Flex>
                  </Hover>
                </Flex>
              </Flex>
            );
          })}
        </VStack>
      </Box>
    );
  }, [displayChains, getMatchAccountsWithUniqueId, onCopyAddress]);

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
