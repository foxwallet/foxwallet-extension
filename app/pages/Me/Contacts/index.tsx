import { useClient } from "@/hooks/useClient";
import { usePopupSelector } from "@/hooks/useStore";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconEmptyTxPlaceholder, IconSearch } from "@/components/Custom/Icon";
import { useCallback, useState } from "react";

const ContactsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currLanguage } = usePopupSelector(
    (state) => ({
      currLanguage: state.setting.language,
      currCurrency: state.setting.currency,
    }),
    isEqual,
  );
  const { popupServerClient } = useClient();
  const [searchStr, setSearchStr] = useState("");

  const onKeywordChange = useCallback(
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
          onChange={onKeywordChange}
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
        </VStack>
      </Content>
    </PageWithHeader>
  );
};

export default ContactsScreen;
