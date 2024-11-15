import { Text, Flex, Textarea, Divider, Button } from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import type React from "react";
import { useMemo, useCallback, useState } from "react";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinBasic } from "@/hooks/useCoinService";
import { useDebounce } from "use-debounce";
import { IconSendContact } from "@/components/Custom/Icon";
import { useNavigate } from "react-router-dom";

interface InputAddressStepProps {}

export const InputAddressStep = (props: InputAddressStepProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [borderColor, setBorderColor] = useState("gray.100");
  const [address, setAddress] = useState("");
  const [debounceAddress] = useDebounce(address, 500);

  // 此处多链需要修改
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;
  const coinBasic = useCoinBasic(uniqueId);

  const onAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (event) {
        setAddress(event.target.value);
      }
    },
    [],
  );

  const addressValid = useMemo(() => {
    if (debounceAddress) {
      const valid = coinBasic.isValidAddress(debounceAddress);
      console.log("valid      " + valid);
      // return valid;  //地雷
      return false;
    }
    return false;
  }, [coinBasic, debounceAddress]);

  const openContact = useCallback(() => {
    navigate("/contacts");
  }, [navigate]);

  const canConfirm = useMemo(() => {
    return !!debounceAddress && !!address && addressValid;
  }, [debounceAddress, address, addressValid]);

  const InvalidAddressWarn = useMemo(() => {
    if (!address || !debounceAddress) {
      return null;
    }
    return addressValid ? null : (
      <Text color={"#EF466F"} fontWeight={500} fontSize={14}>
        {t("Error:invalidAddress")}
      </Text>
    );
  }, [address, addressValid, debounceAddress, t]);

  return (
    <Content>
      <H6 mb={"2"}>{t("Send:to")}</H6>
      <Flex
        minH={"200px"}
        borderRadius={"8px"}
        borderColor={borderColor}
        borderWidth={"1.5px"}
        direction={"column"}
        p={2}
        // bg={"yellow"}
        justify={"space-between"}
      >
        <Flex direction={"column"}>
          <Textarea
            // bg={"aqua"}
            flex={1}
            minH={"130px"}
            alignItems={"flex-start"}
            verticalAlign="top"
            value={address}
            placeholder={t("Send:toPlaceholder")}
            borderColor={"white"}
            _focus={{ borderColor: "white" }}
            onFocus={() => {
              setBorderColor("black");
            }}
            onBlur={() => {
              setBorderColor("gray.50");
            }}
            onChange={onAddressChange}
            isInvalid={!addressValid && !!debounceAddress}
          />
          {InvalidAddressWarn}
        </Flex>
        <Flex direction={"column"}>
          <Divider h={"1px"} bg={"gray.100"} />
          <Flex mt={1} alignItems={"center"} justify={"flex-end"} h={"20px"}>
            <IconSendContact onClick={openContact} />
          </Flex>
        </Flex>
      </Flex>
      <Button
        w={"full"}
        mt={"40px"}
        onClick={() => navigate(`/add_or_edit_contact/add`)}
        isDisabled={!canConfirm}
      >
        {t("Common:next")}
      </Button>
    </Content>
  );
};
