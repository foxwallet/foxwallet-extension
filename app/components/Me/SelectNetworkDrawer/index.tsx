import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { BaseInput } from "@/components/Custom/Input";
import { useTranslation } from "react-i18next";
import { WarningArea } from "@/components/Custom/WarningArea";
import { IconSearch } from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const SelectNetworkDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm } = props;
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

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Contacts:selectNetwork")}
      body={
        <Flex flexDirection={"column"}>
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
        </Flex>
      }
      footer={
        <Flex justify={"space-between"} flex={1}>
          <Button flex={1} onClick={onConfirm}>
            {t("Common:confirm")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showSelectNetworkDrawer =
  promisifyChooseDialogWrapper(SelectNetworkDrawer);
