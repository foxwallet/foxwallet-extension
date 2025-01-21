import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  type OneMatchAccount,
  type OneMatchGroupAccount,
} from "@/scripts/background/store/vault/types/keyring";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { useGroupAccountChainList } from "@/hooks/useChainList";
import { CopyAddressChainItem } from "@/components/Wallet/CopyAddressDrawer";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { useDebounce } from "use-debounce";
import { useSearchNetworks } from "@/hooks/useSearchNetworks";
import { IconSearch } from "@/components/Custom/Icon";
import { showPasswordVerifyDrawer } from "@/components/Custom/PasswordVerifyDrawer";
import {
  type AccountOperateOptions,
  showAccountOptionDrawer,
} from "@/components/Wallet/AccountOptionDrawer";
import { useCurrWallet } from "@/hooks/useWallets";

const AccountMoreScreen = () => {
  const { t } = useTranslation();
  const { showToast } = useCopyToast();
  const navigate = useNavigate();
  const chains: ChainBaseConfig[] = useGroupAccountChainList();
  const currWallet = useCurrWallet();
  const { account: paramAccount } = useParams();
  const account = useMemo(() => {
    try {
      if (!paramAccount) {
        return undefined;
      }
      return JSON.parse(paramAccount) as OneMatchGroupAccount;
    } catch (err) {
      return undefined;
    }
  }, [paramAccount]);
  console.log("      account", account);

  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const { searchRes } = useSearchNetworks(searchStr, chains);

  const displayChains = useMemo(() => {
    return debounceSearchStr ? searchRes : chains;
  }, [debounceSearchStr, chains, searchRes]);

  const onCopyAddress = useCallback(
    async (data: OneMatchAccount) => {
      await navigator.clipboard.writeText(data.account.address);
      showToast();
    },
    [showToast],
  );

  const onExportPrivateKey = useCallback(
    async (config: ChainBaseConfig) => {
      const { confirmed } = await showPasswordVerifyDrawer();
      if (confirmed) {
        const { coinType } = config;
        if (account) {
          const foundAccount = account.group.accounts.find(
            (it) => it.coinType === coinType,
          );
          navigate(
            `/export_private_key/${account?.wallet.walletId}/${foundAccount?.accountId}/${coinType}`,
          );
        }
      }
    },
    [navigate, account],
  );

  const onMore = useCallback(
    async (config: ChainBaseConfig) => {
      if (!account || !currWallet.selectedWallet) {
        return;
      }
      await showAccountOptionDrawer({
        wallet: currWallet.selectedWallet,
        onClickOption: (option: AccountOperateOptions) => {
          onExportPrivateKey(config);
        },
      });
    },
    [account, currWallet.selectedWallet, onExportPrivateKey],
  );

  return (
    <PageWithHeader title={account?.group.groupName ?? ""}>
      <Content>
        <InputGroup flexDir={"column"} position={"relative"} pb={4}>
          <InputLeftElement
            position={"absolute"}
            top={"calc(50% - 20px)"}
            ml={2}
          >
            <IconSearch w={"26px"} h={"26px"} />
          </InputLeftElement>
          <Input
            alignSelf={"stretch"}
            bg={"gray.50"}
            value={searchStr}
            onChange={onKeywordChange}
            placeholder={t("Contacts:networkName")}
            pl={10}
            py={2}
          />
        </InputGroup>
        <Box overflowY="auto">
          <VStack spacing={"10px"}>
            {displayChains.map((item) => {
              return (
                <CopyAddressChainItem
                  item={item}
                  onCopyAddress={onCopyAddress}
                  key={item.uniqueId}
                  hasMore={true}
                  onMore={onMore}
                />
              );
            })}
          </VStack>
        </Box>
      </Content>
    </PageWithHeader>
  );
};

export default AccountMoreScreen;
