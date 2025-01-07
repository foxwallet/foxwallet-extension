import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
} from "@chakra-ui/react";
import { IconEmptyTxPlaceholder, IconSearch } from "@/components/Custom/Icon";
import type React from "react";
import { useMemo, useCallback, useState } from "react";
import { usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { getChainAddressBooksSelector } from "@/store/selectors/address";
import type { InnerChainUniqueId } from "core/types/ChainUniqueId";

const ContactsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uniqueId: paramUniqueId, address: paramAddress } = useParams<{
    uniqueId: InnerChainUniqueId;
    address: string;
  }>();

  const [searchStr, setSearchStr] = useState("");
  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const addressListInStore = usePopupSelector((state) => {
    return getChainAddressBooksSelector(state, {
      uniqueId: paramUniqueId,
    });
  }, isEqual);

  const addressList = useMemo(() => {
    if (!searchStr) {
      return addressListInStore;
    }
    return (
      addressListInStore.filter(
        (item) =>
          item.addressName.toLowerCase()?.includes(searchStr.toLowerCase()) ||
          item.address?.toLowerCase()?.includes(searchStr.toLowerCase()),
      ) ?? []
    );
  }, [addressListInStore, searchStr]);
  console.log("      addressList", addressList);

  return (
    <PageWithHeader title={t("Setting:contacts")}>
      <InputGroup flexDir={"column"} px={5} position={"relative"}>
        <InputLeftElement position={"absolute"} top={"calc(50% - 13px)"} ml={8}>
          <IconSearch w={"26px"} h={"26px"} />
        </InputLeftElement>
        <Input
          alignSelf={"stretch"}
          bg={"gray.50"}
          value={searchStr}
          onChange={onInputChange}
          placeholder={t("Contacts:searchHint")}
          pl={10}
          py={2}
        />
      </InputGroup>
      <Content>
        {addressList.length > 0 ? (
          <VStack spacing={4} justify={"center"} bg={"yellow"}>
            {addressList.map((item, index) => {
              return <Text key={index}>333</Text>;
            })}
          </VStack>
        ) : (
          <IconEmptyTxPlaceholder
            justify={"center"}
            alignSelf={"center"}
            mb={4}
            mt={4}
          />
        )}
        <Button w={"full"} onClick={() => navigate(`/add_or_edit_contact/add`)}>
          {t("Contacts:addContact")}
        </Button>
      </Content>
    </PageWithHeader>
  );
};

export default ContactsScreen;
