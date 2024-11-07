import { useClient } from "@/hooks/useClient";
import { usePopupSelector } from "@/hooks/useStore";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { BaseInput, BaseInputGroup } from "@/components/Custom/Input";
import type React from "react";
import { useEffect, useCallback, useState } from "react";
import { useDebounce } from "use-debounce";
import { useCoinBasic } from "@/hooks/useCoinService";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

interface AddContactProps {
  paramAddress?: string;
}

const AddContactScreen = (props: AddContactProps) => {
  const { paramAddress } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 此处多链需要修改
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;
  const coinBasic = useCoinBasic(uniqueId);

  const [contactName, setContactName] = useState("");
  const [address, setAddress] = useState(paramAddress ?? "");
  const [addressValid, setAddressValid] = useState(false);
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
      setAddressValid(true);
      setAddress(event.target.value);
    },
    [],
  );

  useEffect(() => {
    if (debounceAddress) {
      const valid = coinBasic.isValidAddress(debounceAddress);
      console.log("valid      " + valid);
      setAddressValid(valid);
    }
  }, [debounceAddress, coinBasic]);

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
          isInvalid={!!debounceAddress && !addressValid}
        />
        <Button mt={10} w={"full"} onClick={() => {}}>
          {t("Contacts:confirmCreate")}
        </Button>
      </Content>
    </PageWithHeader>
  );
};

export default AddContactScreen;
