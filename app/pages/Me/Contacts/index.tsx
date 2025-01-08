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
  Flex,
} from "@chakra-ui/react";
import {
  IconEmptyTxPlaceholder,
  IconMore,
  IconSearch,
} from "@/components/Custom/Icon";
import type React from "react";
import { useMemo, useCallback, useState } from "react";
import { usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { getChainAddressBooksSelector } from "@/store/selectors/address";
import type { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type AddressItemV2 } from "@/store/addressModel";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { useChainConfigs } from "@/hooks/useGroupAccount";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { showContactMoreDrawer } from "@/components/Me/ContactMoreDrawer";
import { serializeData, serializeToken } from "@/common/utils/string";

const maxLabelNumber = 3;

const ContactItem = ({
  item,
  onClick,
}: {
  item: AddressItemV2;
  onClick: () => void;
}) => {
  const chainConfigs = useChainConfigs(item.uniqueIds);
  const { showToast } = useCopyToast();
  const navigate = useNavigate();

  const onClickContactItem = useCallback(async () => {
    await navigator.clipboard.writeText(item.address);
    showToast();
  }, [item.address, showToast]);

  const onEditContact = useCallback(
    (item: AddressItemV2) => {
      navigate(`/add_or_edit_contact/edit?addressItem=${serializeData(item)}`);
    },
    [navigate],
  );

  const onRemoveContact = useCallback((item: AddressItemV2) => {}, []);

  const onMore = useCallback(async () => {
    await showContactMoreDrawer({ item, onEditContact, onRemoveContact });
  }, [item, onEditContact, onRemoveContact]);

  const label = useMemo(() => {
    return (
      <Flex maxW={"250px"} bg={"#f9f9f9"} pl={1}>
        {chainConfigs.slice(0, maxLabelNumber).map((config, index) => {
          return (
            <Text key={config.uniqueId} fontSize={"11px"} mr={1} noOfLines={1}>
              {`${config.chainName}` +
                (chainConfigs.length > index + 1 ? "," : "")}
            </Text>
          );
        })}
        {chainConfigs.length > maxLabelNumber && (
          <Text fontSize={"11px"} mr={1} noOfLines={1}>
            ···
          </Text>
        )}
      </Flex>
    );
  }, [chainConfigs]);

  return (
    <Flex
      key={item.id}
      w={"100%"}
      h={"54px"}
      justify={"space-between"}
      alignItems={"center"}
      cursor={"pointer"}
      onClick={onClickContactItem}
    >
      {/* avatar name labels address */}
      <Flex alignItems={"center"}>
        {/* avatar */}
        <Flex
          bg={"#e6e8ec"}
          justify={"center"}
          alignItems={"center"}
          w={"26px"}
          h={"26px"}
          borderRadius={"13px"}
        >
          <Text fontWeight={"bold"} fontSize={"12px"}>
            {item.addressName[0]}
          </Text>
        </Flex>
        {/* name labels address */}
        <Flex flexDirection={"column"} ml={2}>
          <Flex alignItems={"center"}>
            <Text fontWeight={"bold"} fontSize={"12px"}>
              {item.addressName}
            </Text>
            <Flex ml={2} alignItems={"center"}>
              {label}
            </Flex>
          </Flex>
          {/* address */}
          <MiddleEllipsisText
            text={item.address}
            width={280}
            style={{
              color: "#777E90",
              fontSize: "11px",
            }}
          />
        </Flex>
      </Flex>
      {/* more button */}
      <Flex
        h={"100%"}
        alignItems={"center"}
        onClick={(event) => {
          event.stopPropagation();
          onMore();
        }}
        pl={2}
      >
        <IconMore />
      </Flex>
    </Flex>
  );
};

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
          <VStack
            spacing={2}
            justify={"start"}
            h={"420px"}
            overflowY={"auto"}
            css={{
              "&::-webkit-scrollbar": {
                display: "none", // WebKit: Chrome、Safari
              },
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE and Edge
            }}
          >
            {addressList.map((item, index) => {
              return (
                <ContactItem item={item} key={item.id} onClick={() => {}} />
              );
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
        <Button
          mt={"10px"}
          w={"full"}
          onClick={() => navigate(`/add_or_edit_contact/add`)}
        >
          {t("Contacts:addContact")}
        </Button>
      </Content>
    </PageWithHeader>
  );
};

export default ContactsScreen;
