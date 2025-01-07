import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Flex, Text } from "@chakra-ui/react";
import { BaseInput, BaseInputGroup } from "@/components/Custom/Input";
import type React from "react";
import { useMemo, useEffect, useCallback, useState } from "react";
import { useDebounce } from "use-debounce";
import { useCoinBasic, useCoinService } from "@/hooks/useCoinService";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
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

  const [addressUniqueIds, setAddressUniqueIds] = useState<ChainUniqueId[]>(
    !isAdd ? addressItemInfo?.uniqueIds ?? [] : [],
  );

  const [address, setAddress] = useState(
    !isAdd ? addressItemInfo?.address ?? "" : "",
  );
  const [name, setName] = useState(
    !isAdd ? addressItemInfo?.addressName ?? "" : "",
  );

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
    return !isAdd ? false : hasDupAddressSelector(state, { address });
  });

  const {
    valid: addressValid,
    supportChains,
    isEVMAddress,
  } = useMemo(() => matchAddressSupportedUniqueIds(address), [address]);

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

  const onSelectChains = useCallback(
    (configs: ChainBaseConfig[]) => {
      if (configs.length === 0) {
        return;
      }
      setShowInAllEVM(
        isEqual(
          allEVMChains.map((cfg) => cfg.uniqueId),
          configs.map((cfg) => cfg.uniqueId),
        ),
      );
      setAddressUniqueIds(configs.map((item) => item.uniqueId));
    },
    [allEVMChains],
  );

  const onSelectNetwork = useCallback(async () => {
    const { data } = await showSelectContactNetworkDrawer({});
  }, []);

  const canSubmit = useMemo(
    () =>
      address &&
      !addressExist &&
      addressValid &&
      name &&
      addressUniqueIds.length > 0,
    [address, addressExist, addressUniqueIds, addressValid, name],
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

  const onRemove = useCallback(() => {
    if (isAdd && !addressItemInfo) {
      return;
    }
    dispatch.address.removeAddress({ id: addressItemInfo!.id });
    navigate(-1);
  }, [addressItemInfo, dispatch, isAdd, navigate]);

  const { deleteColor } = useThemeStyle();

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
          isInvalid={!addressValid && !!address}
        />
        {address && (
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
        <Button mt={10} w={"full"} onClick={onSubmit} isDisabled={!canSubmit}>
          {isAdd ? t("Contacts:confirmCreate") : t("Contacts:confirmUpdate")}
        </Button>
        {!isAdd && (
          <Button
            backgroundColor={deleteColor}
            mt={5}
            w={"full"}
            onClick={onRemove}
          >
            {t("Contacts:remove")}
          </Button>
        )}
      </Content>
    </PageWithHeader>
  );
};

export default AddOrEditContactScreen;
