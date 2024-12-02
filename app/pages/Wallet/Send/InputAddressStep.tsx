import { Button, Divider, Flex, Text, Textarea } from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";
import { useTranslation } from "react-i18next";
import { Content } from "@/layouts/Content";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { useCoinService } from "@/hooks/useCoinService";
import { useDebounce } from "use-debounce";
import { IconSendContact } from "@/components/Custom/Icon";
import { useNavigate } from "react-router-dom";

interface InputAddressStepProps {
  uniqueId: ChainUniqueId;
  onStep2: (toAddr: string) => void;
  toAddr?: string;
}

export const InputAddressStep = (props: InputAddressStepProps) => {
  const { uniqueId, onStep2, toAddr } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [borderColor, setBorderColor] = useState("gray.50");
  const [address, setAddress] = useState(toAddr ?? "");
  const [debounceAddress] = useDebounce(address, 500);

  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);

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
      return coinService.validateAddress(debounceAddress);
    }
    return false;
  }, [coinService, debounceAddress]);

  const openContact = useCallback(() => {
    navigate("/contacts");
  }, [navigate]);

  const canConfirm = useMemo(() => {
    return !!debounceAddress && !!address && addressValid;
  }, [debounceAddress, address, addressValid]);

  const AddressInfo = useMemo(() => {
    if (!address || !debounceAddress) {
      return null;
    }
    return addressValid ? null : (
      <Text color={"#EF466F"} fontWeight={500} fontSize={14}>
        {t("Error:invalidAddress")}
      </Text>
    );
  }, [address, addressValid, debounceAddress, t]);

  // get address from contacts
  useEffect(() => {
    const addr = sessionStorage.getItem("contactAddress");
    if (addr) {
      setAddress(addr);
    }
    sessionStorage.removeItem("contactAddress");
  }, []);

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
        justify={"space-between"}
      >
        <Flex direction={"column"}>
          <Textarea
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
          {AddressInfo}
        </Flex>
        <Flex direction={"column"}>
          <Divider h={"1px"} bg={"gray.50"} />
          <Flex mt={1} alignItems={"center"} justify={"flex-end"} h={"20px"}>
            <Button size={"xxs"} bg={"transparent"} onClick={openContact}>
              <IconSendContact style={{ pointerEvents: "none" }} />
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Button
        w={"full"}
        mt={"40px"}
        onClick={() => {
          onStep2(address);
        }}
        isDisabled={!canConfirm}
      >
        {t("Send:next")}
      </Button>
    </Content>
  );
};
