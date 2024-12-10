import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  Text,
  VStack,
} from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { BaseInput } from "@/components/Custom/Input";
import { useTranslation } from "react-i18next";
import { WarningArea } from "@/components/Custom/WarningArea";
import {
  IconCloseLine,
  IconSearch,
  IconSettings,
} from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";
import { HeaderMiddleView } from "@/components/Wallet/AccountInfoHeader";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  onNetworks: () => void;
  onWallet: () => void;
}

const ChangeNetworkDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm, title, onNetworks, onWallet } = props;
  const { t } = useTranslation();
  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const onManageNetworks = useCallback(() => {
    onCancel?.();
    onNetworks?.();
  }, [onCancel, onNetworks]);

  const onManageWallet = useCallback(() => {
    onCancel?.();
    onWallet();
  }, [onCancel, onWallet]);

  const data = [1, 2, 3, 4, 5];

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
        <Flex flexDirection={"column"} h={450} bg={"yellow"}>
          <InputGroup flexDir={"column"} position={"relative"} pb={4}>
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
          <Box overflowY="auto">
            <VStack spacing={2}>
              {data.map((item, index) => (
                <Text key={index} w="full" h={100} bg={"blue"}>
                  {item}
                </Text>
              ))}
            </VStack>
          </Box>
        </Flex>
      }
      // footer={
      //   <Flex justify={"space-between"} flex={1}>
      //     <Button flex={1} onClick={onConfirm}>
      //       {t("Common:confirm")}
      //     </Button>
      //   </Flex>
      // }
    />
  );
};

export const showChangeNetworkDrawer =
  promisifyChooseDialogWrapper(ChangeNetworkDrawer);
