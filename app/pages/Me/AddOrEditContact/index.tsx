import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Flex, Text, Image } from "@chakra-ui/react";
import { BaseInput } from "@/components/Custom/Input";
import type React from "react";
import { useEffect, useMemo, useCallback, useState } from "react";
import { useDebounce } from "use-debounce";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { IconChevronRight } from "@/components/Custom/Icon";
import { showSelectContactNetworkDrawer } from "@/components/Me/SelectContactNetworkDrawer";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { hasDupAddressSelector } from "@/store/selectors/address";
import { matchAddressSupportedUniqueIds } from "@/common/utils/address";
import { CoinType } from "core/types";
import { useLocationParams } from "@/hooks/useLocationParams";
import { type AddressItemV2 } from "@/store/addressModel";
import { usePopupDispatch } from "@/hooks/useStore";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { isEqual } from "lodash";
import { useChainConfigs } from "@/hooks/useGroupAccount";
import { showContactDeleteDialog } from "@/components/Me/ContactDeleteDialog";

const DisplayedUniqueIdMaxLimit = 5;

const AddOrEditContactScreen = () => {
  const { addOrEdit = "add" } = useParams(); // "add" "edit"
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();

  const isAdd = useMemo(() => addOrEdit === "add", [addOrEdit]);
  const addressItem = useLocationParams("addressItem");

  useEffect(() => {
    if (!isAdd && !addressItem) {
      throw new Error("Edit address failed");
    }
  }, [isAdd, addressItem]);

  // edit 时传入的address对象
  const addressItemInfo = useMemo(() => {
    try {
      if (!addressItem) {
        return undefined;
      }
      return JSON.parse(addressItem) as AddressItemV2;
    } catch (err) {
      return undefined;
    }
  }, [addressItem]);
  // console.log("      addressItemInfo", addressItemInfo);

  const [addressUniqueIds, setAddressUniqueIds] = useState<ChainUniqueId[]>(
    isAdd ? [] : addressItemInfo?.uniqueIds ?? [],
  );

  const [address, setAddress] = useState(
    isAdd ? "" : addressItemInfo?.address ?? "",
  );
  const [name, setName] = useState(
    isAdd ? "" : addressItemInfo?.addressName ?? "",
  );
  const [debounceAddress] = useDebounce(address, 500);

  const initChainConfigs = useChainConfigs(addressUniqueIds);

  const onContactNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setName(value);
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

  const addressExist = useSelector((state: RootState) => {
    return !isAdd
      ? false
      : hasDupAddressSelector(state, { address: debounceAddress });
  });

  const {
    valid: addressValid,
    supportChains,
    isEVMAddress,
  } = useMemo(
    () => matchAddressSupportedUniqueIds(debounceAddress),
    [debounceAddress],
  );

  const [showInAllEVM, setShowInAllEVM] = useState(false);
  const allEVMChains = useMemo(
    () => supportChains.filter((cfg) => cfg.coinType === CoinType.ETH),
    [supportChains],
  );

  useEffect(() => {
    if (supportChains.length === 1 && isAdd) {
      setAddressUniqueIds([supportChains[0].uniqueId]);
    }
  }, [isAdd, supportChains]);

  const [userSelectedChains, setUserSelectedChains] =
    useState<ChainBaseConfig[]>(initChainConfigs);

  const onSelectChains = useCallback(
    (configs: ChainBaseConfig[]) => {
      if (configs.length === 0) {
        setUserSelectedChains([]);
        return;
      }
      setShowInAllEVM(
        isEqual(
          allEVMChains.map((cfg) => cfg.uniqueId),
          configs.map((cfg) => cfg.uniqueId),
        ),
      );
      // setAddressUniqueIds(configs.map((item) => item.uniqueId));
      setUserSelectedChains(configs);
    },
    [allEVMChains],
  );

  useEffect(() => {
    setAddressUniqueIds(userSelectedChains.map((cfg) => cfg.uniqueId));
  }, [userSelectedChains]);

  const onSelectNetwork = useCallback(async () => {
    await showSelectContactNetworkDrawer({
      onSelectChains,
      supportChains,
      selectedUniqueId: addressUniqueIds,
    });
  }, [addressUniqueIds, onSelectChains, supportChains]);

  const canSubmit = useMemo(
    () =>
      debounceAddress &&
      !addressExist &&
      addressValid &&
      name &&
      addressUniqueIds.length > 0,
    [debounceAddress, addressExist, addressUniqueIds, addressValid, name],
  );

  const onSubmit = useCallback(() => {
    if (!canSubmit) {
      return;
    }

    const item: Omit<AddressItemV2, "id"> = {
      address,
      addressName: name,
      uniqueIds: addressUniqueIds,
      isShowInAllEVM: showInAllEVM,
    };

    if (isAdd) {
      dispatch.address.addAddress({ addressItem: item });
    } else {
      dispatch.address.editAddress({
        id: addressItemInfo!.id,
        newAddressItem: item,
      });
    }
    navigate(-1);
  }, [
    address,
    addressItemInfo,
    addressUniqueIds,
    canSubmit,
    dispatch.address,
    isAdd,
    name,
    navigate,
    showInAllEVM,
  ]);

  const onRemove = useCallback(async () => {
    if (isAdd && !addressItemInfo) {
      return;
    }

    try {
      const { confirmed } = await showContactDeleteDialog();
      if (confirmed) {
        dispatch.address.removeAddress({ id: addressItemInfo!.id });
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
    }
  }, [addressItemInfo, dispatch, isAdd, navigate]);

  const { deleteColor } = useThemeStyle();

  const addressWarn = useMemo(() => {
    let warnStr = "";
    if (!addressValid && !!debounceAddress) {
      warnStr = t("Contacts:invalidAddress");
    } else if (addressExist) {
      warnStr = t("Contacts:alreadyExist");
    }
    return warnStr ? (
      <Text fontSize={"12px"} mt={2} color={"#EF466F"}>
        {warnStr}
      </Text>
    ) : null;
  }, [debounceAddress, addressExist, addressValid, t]);

  const renderSelectNetwork = useMemo(() => {
    return debounceAddress && addressValid && !addressExist ? (
      <Flex
        flexDir={"row"}
        borderStyle={"solid"}
        borderColor={"gray.50"}
        borderWidth={"1.5px"}
        borderRadius={"lg"}
        px={4}
        mt={2}
        onClick={onSelectNetwork}
        justify={"space-between"}
        align={"center"}
        h={"48px"}
      >
        <Flex>
          {userSelectedChains.length > 0 ? (
            userSelectedChains
              .slice(0, DisplayedUniqueIdMaxLimit)
              .map((item, index) => {
                return (
                  <Flex key={item.uniqueId} ml={index === 0 ? 0 : -1}>
                    <Image src={item.logo} w={6} h={6} borderRadius={12} />
                  </Flex>
                );
              })
          ) : (
            <Text>{t("Contacts:selectNetwork")}</Text>
          )}
        </Flex>
        <IconChevronRight w={4} h={4} mr={-1} />
      </Flex>
    ) : null;
  }, [
    debounceAddress,
    addressValid,
    addressExist,
    onSelectNetwork,
    userSelectedChains,
    t,
  ]);

  return (
    <PageWithHeader title={t("Contacts:addContact")}>
      <Content>
        <BaseInput
          title={t("Contacts:contactInfo")}
          placeholder={t("Contacts:enterContactName")}
          container={{ mt: "2" }}
          value={name}
          onChange={onContactNameChange}
        />
        <BaseInput
          placeholder={t("Contacts:enterAddress")}
          container={{ mt: "2" }}
          value={address}
          onChange={onAddressChange}
          isInvalid={(!addressValid && !!debounceAddress) || addressExist}
        />
        {addressWarn}
        {renderSelectNetwork}
        <Button mt={10} w={"full"} onClick={onSubmit} isDisabled={!canSubmit}>
          {isAdd ? t("Contacts:confirmCreate") : t("Contacts:confirmUpdate")}
        </Button>
        {!isAdd && (
          <Button
            backgroundColor={deleteColor}
            mt={5}
            w={"full"}
            onClick={onRemove}
            textColor={"white"}
          >
            {t("Contacts:remove")}
          </Button>
        )}
      </Content>
    </PageWithHeader>
  );
};

export default AddOrEditContactScreen;
