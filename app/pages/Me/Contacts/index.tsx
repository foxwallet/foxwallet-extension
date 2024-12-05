import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@chakra-ui/react";
import { IconEmptyTxPlaceholder, IconSearch } from "@/components/Custom/Icon";
import type React from "react";
import { useCallback, useState } from "react";

const ContactsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchStr, setSearchStr] = useState("");

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

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
        <VStack spacing={4} justify={"center"} h={"70%"}>
          <IconEmptyTxPlaceholder />
          <Button
            w={"full"}
            onClick={() => navigate(`/add_or_edit_contact/add`)}
          >
            {t("Contacts:addContact")}
          </Button>
          <Button
            w={"full"}
            onClick={() => {
              sessionStorage.setItem(
                "contactAddress",
                "0xbA3b212Ef2A2bf9b94955c904D8770bd774c3D2a",
              );
              navigate(-1);
            }}
          >
            test address
          </Button>
        </VStack>
      </Content>
    </PageWithHeader>
  );
};

export default ContactsScreen;
