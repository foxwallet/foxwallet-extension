import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Flex, Text } from "@chakra-ui/react";
import { BaseInput, BaseInputGroup } from "@/components/Custom/Input";
import type React from "react";
import { useMemo, useEffect, useCallback, useState } from "react";
import { useDebounce } from "use-debounce";
import { useCoinBasic } from "@/hooks/useCoinService";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { IconChevronRight } from "@/components/Custom/Icon";
import { showSelectNetworkDrawer } from "@/components/Me/SelectNetworkDrawer";
import { useThemeStyle } from "@/hooks/useThemeStyle";

const AddOrEditContactScreen = () => {
  const { addOrEdit } = useParams(); // "add" "edit"
  const { t } = useTranslation();
  const isAdd = useMemo(() => addOrEdit === "add", [addOrEdit]);
  const { deleteColor } = useThemeStyle();

  // 此处多链需要修改
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;
  const coinBasic = useCoinBasic(uniqueId);

  const [contactName, setContactName] = useState("");
  const [address, setAddress] = useState("");
  const [debounceAddress] = useDebounce(address, 500);

  const onContactNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setContactName(value);
    },
    [],
  );

  const onAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // setAddressValid(true);
      setAddress(event.target.value);
    },
    [],
  );

  const addressValid = useMemo(() => {
    if (debounceAddress) {
      const valid = coinBasic.isValidAddress(debounceAddress);
      console.log("valid      " + valid);
      return valid;
    }
    return true;
  }, [coinBasic, debounceAddress]);

  const onSelectNetwork = useCallback(async () => {
    const { data } = await showSelectNetworkDrawer({});
  }, []);

  const canSubmit = useMemo(() => {
    if (!contactName || !debounceAddress || !addressValid) {
      return false;
    }
    return true;
  }, [addressValid, contactName, debounceAddress]);

  const onConfirm = useCallback(() => {}, []);

  const onDelete = useCallback(() => {}, []);

  return (
    <PageWithHeader title={t("Contacts:addContact")}>
      <Content>
        <BaseInput
          title={t("Contacts:contactInfo")}
          placeholder={t("Contacts:enterContactName")}
          container={{ mt: "2" }}
          value={contactName}
          onChange={onContactNameChange}
        />
        <BaseInput
          placeholder={t("Contacts:enterAddress")}
          container={{ mt: "2" }}
          value={address}
          onChange={onAddressChange}
          isInvalid={!addressValid && !!debounceAddress}
        />
        {/* {addressValid && debounceAddress && ( */}
        {debounceAddress && (
          <Flex
            flexDir={"row"}
            borderStyle={"solid"}
            borderColor={"gray.50"}
            borderWidth={"1.5px"}
            borderRadius={"lg"}
            px={4}
            py={3}
            mt={2}
            onClick={onSelectNetwork}
            justify={"space-between"}
            align={"center"}
          >
            <Text>{t("Contacts:selectNetwork")}</Text>
            <IconChevronRight w={4} h={4} mr={-1} />
          </Flex>
        )}
        <Button mt={10} w={"full"} onClick={onConfirm} isDisabled={!canSubmit}>
          {isAdd ? t("Contacts:confirmCreate") : t("Contacts:confirmUpdate")}
        </Button>
        {!isAdd && (
          <Button
            backgroundColor={deleteColor}
            mt={5}
            w={"full"}
            onClick={onDelete}
          >
            {t("Contacts:remove")}
          </Button>
        )}
      </Content>
    </PageWithHeader>
  );
};

export default AddOrEditContactScreen;
