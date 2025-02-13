import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import {
  Box,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import {
  IconCheckboxSelected,
  IconCheckboxUnselected,
  IconInfo,
  IconSearch,
} from "@/components/Custom/Icon";
import type React from "react";
import { useRef, useMemo, useCallback, useState } from "react";
import { useDebounce } from "use-debounce";
import { EmptyView } from "@/components/Custom/EmptyView";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { useSelector } from "react-redux";
import { type RootState, store } from "@/store/store";
import {
  getChainConfigsByFilter,
  useGroupAccount,
} from "@/hooks/useGroupAccount";
import { isEqual } from "lodash";
import { currSelectedChainsSelector } from "@/store/selectors/account";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import { useNavigate } from "react-router-dom";
import { ETH_CHAIN_CONFIGS } from "core/coins/ETH/config/chains";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { getDefaultChainUniqueId } from "core/constants/chain";
import { type AccountOption } from "core/types/CoinBasic";
import { type CoinType } from "core/types";
import { usePopupDispatch } from "@/hooks/useStore";
import { showNavigateToWalletManageDialog } from "@/components/Me/NavigateToWalletManageDialog";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { useCurrWallet } from "@/hooks/useWallets";
import { useSearchNetworks } from "@/hooks/useSearchNetworks";
import {
  useAllChainList,
  useGroupAccountChainList,
} from "@/hooks/useChainList";

export type NetworkListItemProps = {
  item: ChainBaseConfig;
  isSelected: boolean;
  onPressItem: (item: ChainBaseConfig, isSelected: boolean) => void;
  isSimple: boolean;
  simpleCoinType?: CoinType;
};

export const NetworkListItem = (props: NetworkListItemProps) => {
  const { item, isSelected, onPressItem, isSimple, simpleCoinType } = props;
  // const titleColor = useColorModeValue("black", "white");
  const language = getCurrLanguage();
  const navigate = useNavigate();
  const titleColor = useMemo(() => {
    if (isSimple) {
      return item.coinType === simpleCoinType ? "black" : "gray.400";
    }
    return "black";
  }, [isSimple, item.coinType, simpleCoinType]);

  const remark =
    item.chainRemark?.[language] ?? item.chainRemark?.[SupportLanguages.EN];
  const chainName = remark ? `${item.chainName} - ${remark}` : item.chainName;

  const onSelect = useCallback(async () => {
    onPressItem(item, isSelected);
  }, [isSelected, item, onPressItem]);

  const onInfo = useCallback(() => {
    navigate(`/network_detail/${item.uniqueId}`);
  }, [item.uniqueId, navigate]);

  return (
    <Flex
      alignItems={"center"}
      justify={"space-between"}
      w={"full"}
      minH={"44px"}
    >
      <Flex
        cursor={"pointer"}
        justify={"start"}
        alignItems={"center"}
        h={"full"}
        w={"full"}
        onClick={onSelect}
      >
        {isSelected ? (
          <IconCheckboxSelected ml={1} />
        ) : (
          <IconCheckboxUnselected ml={1} />
        )}
        <Image
          src={item.logo}
          w={"24px"}
          h={"24px"}
          borderRadius={"50px"}
          ml={2}
        />
        <Text ml={2} fontSize={13} color={titleColor} align={"start"}>
          {chainName}
        </Text>
      </Flex>
      <Flex
        cursor={"pointer"}
        mr={1}
        w={8}
        h={"full"}
        justify={"center"}
        alignItems={"center"}
        onClick={onInfo}
      >
        <IconInfo />
      </Flex>
    </Flex>
  );
};

const NetworksScreen = () => {
  const { t } = useTranslation();
  const { groupAccount } = useGroupAccount();
  const dispatch = usePopupDispatch();
  const [searchStr, setSearchStr] = useState("");
  const [debounceAddress] = useDebounce(searchStr, 500);
  const titleColor = useColorModeValue("black", "white");
  const navigate = useNavigate();
  const { selectedWallet: wallet } = useCurrWallet();

  // const chainConfigs = useSelector((state: RootState) => {
  //   return getChainConfigsByFilter({
  //     state,
  //     filter: (_item) => {
  //       return true;
  //     },
  //   });
  // }, isEqual);
  // const chainConfigs = useGroupAccountChainList();
  const chainConfigs = useAllChainList();

  console.log("      groupAccount", groupAccount);
  const reserveUniqueId = useMemo(() => {
    if (groupAccount.wallet.walletType === WalletType.HD) {
      return ETH_CHAIN_CONFIGS.MAIN_NET.uniqueId; // 多链钱包时, eth 作为保留链
    }
    const account = groupAccount.group.accounts[0];
    return getDefaultChainUniqueId(account.coinType, account.option);
  }, [groupAccount]);
  console.log("      reserveUniqueId", reserveUniqueId);

  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const addingAccountRef = useRef(false);

  const disableSwitchNetworkWithOptionFilter = useCallback(
    (item: ChainBaseConfig) => {
      if (!item.chainOptionFilter) return false;
      const accounts = groupAccount.group.accounts;
      for (const filterKey in item.chainOptionFilter) {
        if (
          accounts.every(
            (account) =>
              account.option?.[filterKey as keyof AccountOption[CoinType]] !==
              item.chainOptionFilter![
                filterKey as keyof AccountOption[CoinType]
              ],
          )
        ) {
          return true;
        }
      }
      return false;
    },
    [groupAccount.group.accounts],
  );

  const selectedUniqueIds = useSelector((state: RootState) => {
    return currSelectedChainsSelector(state);
  }, isEqual);
  console.log("      selectedUniqueIds", selectedUniqueIds);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const { searchRes, searching: loading } = useSearchNetworks(
    searchStr,
    chainConfigs,
  );

  const dataList = useMemo(() => {
    return debounceAddress ? searchRes : chainConfigs;
  }, [chainConfigs, debounceAddress, searchRes]);

  const showEmpty = useMemo(() => {
    return debounceAddress && dataList.length === 0;
  }, [debounceAddress, dataList.length]);

  const isSimple = useMemo(
    () => groupAccount.wallet.walletType === WalletType.SIMPLE,
    [groupAccount],
  );
  const simpleCoinType = useMemo(() => {
    return isSimple ? groupAccount.group.accounts[0].coinType : undefined;
  }, [groupAccount.group.accounts, isSimple]);

  const onPressItem = useCallback(
    async (item: ChainBaseConfig, isSelected: boolean) => {
      console.log("      groupAccount", groupAccount);
      console.log("      item", item);
      if (
        groupAccount.wallet.walletType === WalletType.SIMPLE &&
        (groupAccount.group.accounts[0].coinType !== item.coinType ||
          disableSwitchNetworkWithOptionFilter(item))
      ) {
        const { confirmed } = await showNavigateToWalletManageDialog();
        if (confirmed) {
          navigate("/manage_wallet");
        }
        return;
      }

      if (isSelected) {
        if (reserveUniqueId === item.uniqueId) {
          await showErrorToast({ message: t("Networks:defaultChainRemind") });
          return;
        }
        dispatch.multiChain.removeUserSelectedChain({
          walletId: groupAccount.wallet.walletId,
          uniqueId: item.uniqueId,
        });
      } else {
        if (groupAccount.wallet.walletType === WalletType.HD && wallet) {
          if (addingAccountRef.current) {
            return;
          }
        }
        dispatch.multiChain.addUserSelectedChain({
          walletId: groupAccount.wallet.walletId,
          uniqueId: item.uniqueId,
          select: true,
        });
      }
    },
    [
      disableSwitchNetworkWithOptionFilter,
      dispatch.multiChain,
      groupAccount,
      navigate,
      reserveUniqueId,
      t,
      wallet,
    ],
  );

  const renderNetworkItem = useCallback(
    (item: ChainBaseConfig) => {
      const isSelected = !!selectedUniqueIds?.some(
        (id) => id === item.uniqueId,
      );
      return (
        <NetworkListItem
          key={item.uniqueId}
          item={item}
          isSelected={isSelected}
          onPressItem={onPressItem}
          isSimple={isSimple}
          simpleCoinType={simpleCoinType}
        />
      );
    },
    [isSimple, onPressItem, selectedUniqueIds, simpleCoinType],
  );

  return (
    <PageWithHeader title={t("Networks:title")}>
      <InputGroup flexDir={"column"} px={5} position={"relative"}>
        <InputLeftElement position={"absolute"} top={"calc(50% - 13px)"} ml={8}>
          <IconSearch w={"26px"} h={"26px"} />
        </InputLeftElement>
        <Input
          alignSelf={"stretch"}
          bg={"gray.50"}
          value={searchStr}
          onChange={onInputChange}
          placeholder={t("Networks:searchHint")}
          pl={10}
          py={2}
        />
      </InputGroup>
      <Content>
        {showEmpty ? (
          <EmptyView searching={false} text={t("Common:noSearchResult")} />
        ) : (
          <Box overflowY="auto" maxHeight={"calc(100vh - 120px)"}>
            <VStack spacing={"10px"}>
              {dataList.map((item) => {
                return renderNetworkItem(item);
              })}
            </VStack>
          </Box>
        )}
      </Content>
    </PageWithHeader>
  );
};

export default NetworksScreen;
