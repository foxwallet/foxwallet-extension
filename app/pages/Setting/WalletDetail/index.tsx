import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import {
  IconAleo,
  IconCopy,
  IconEdit,
  IconMore,
} from "@/components/Custom/Icon";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showPasswordVerifyDrawer } from "@/components/Custom/PasswordVerifyDrawer";
import {
  AccountOperateOptions,
  showAccountOptionDrawer,
} from "@/components/Wallet/AccountOptionDrawer";
import { showEditAccountNameDrawer } from "@/components/Wallet/EditAccountNameDrawer";
import {
  WalletOperateOption,
  showWalletOptionDrawer,
} from "@/components/Wallet/WalletOptionDrawer";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useWallets } from "@/hooks/useWallets";
import { PageWithHeader } from "@/layouts/Page";
import { SelectedAccount } from "@/scripts/background/store/vault/types/keyring";
import { Box, Button, Flex, Text, useClipboard } from "@chakra-ui/react";
import { CoinType } from "core/types";
import { nanoid } from "nanoid";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

interface AccountListItemProps {
  account: SelectedAccount;
}
const AccountListItem: React.FC<AccountListItemProps> = ({ account }) => {
  const { onCopy } = useClipboard(account.address);
  const { showToast } = useCopyToast();
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();

  const { selectedAccount } = useCurrAccount();

  const allWalletInfo = usePopupSelector(
    (state) => state.account.allWalletInfo,
  );

  const operatingWallet = useMemo(
    () => allWalletInfo[account.walletId],
    [allWalletInfo, account.walletId],
  );

  const accountListInWallet = useMemo(
    () => operatingWallet?.accountsMap?.[CoinType.ALEO] || [],
    [operatingWallet.accountsMap],
  );

  const handleEditName = useCallback(() => {
    showEditAccountNameDrawer({
      account,
    });
  }, [account]);

  const handleCopyAddress = useCallback(() => {
    showToast();
    onCopy();
  }, [onCopy, showToast]);

  const onExportPrivateKey = useCallback(async () => {
    const { confirmed } = await showPasswordVerifyDrawer();
    if (confirmed) {
      navigate(
        `/export_private_key/${account.walletId}/${account.accountId}/${CoinType.ALEO}`,
      );
    }
  }, [navigate, account]);

  const onChangeVisibility = useCallback(() => {
    let newSelectedAccount: SelectedAccount | undefined;

    if (selectedAccount.accountId === account.accountId && !account.hide) {
      const nextAccount = accountListInWallet.find(
        (a) => a.accountId !== account.accountId && !a.hide,
      );
      if (nextAccount) {
        newSelectedAccount = {
          ...nextAccount,
          walletId: operatingWallet.walletId,
          coinType: CoinType.ALEO,
        };
      }
    }

    dispatch.account.changeAccountHideState({
      walletId: operatingWallet.walletId,
      accountId: account.accountId,
      coinType: account.coinType,
      hide: !account.hide,
    });

    if (newSelectedAccount) {
      dispatch.account.setSelectedAccount({
        selectedAccount: newSelectedAccount,
      });
    }
  }, [
    dispatch.account,
    account,
    selectedAccount.accountId,
    accountListInWallet,
    operatingWallet.walletId,
  ]);

  const handleShowMore = useCallback(() => {
    showAccountOptionDrawer({
      wallet: operatingWallet,
      account,
      onClickOption: (option) => {
        switch (option) {
          case AccountOperateOptions.ExportPrivateKey:
            onExportPrivateKey();
            break;
          case AccountOperateOptions.ChangeVisibility:
            onChangeVisibility();
            break;
          default:
            break;
        }
      },
    });
  }, [account, onExportPrivateKey, onChangeVisibility]);

  return (
    <Flex
      mt={2.5}
      borderWidth={1}
      borderColor={"#E6E8EC"}
      borderRadius={8}
      px={2.5}
      flex={1}
      minH={"60px"}
      align={"center"}
      justifyContent={"space-between"}
    >
      <Flex direction={"column"}>
        <Flex align={"center"}>
          <Text
            mr={1}
            fontSize={13}
            fontWeight={"bold"}
            color={!!account.hide ? "#777E90" : "#000"}
            align={"start"}
          >
            {account.accountName}
          </Text>
          <Box
            as="button"
            onClick={handleEditName}
            p={1}
            borderRadius={11}
            _hover={{ backgroundColor: "#F5F5F5" }}
          >
            <IconEdit />
          </Box>
        </Flex>
        <Flex align={"center"}>
          <Box
            maxW={240}
            noOfLines={1}
            fontSize={9}
            fontWeight={500}
            color={"#777E90"}
          >
            <MiddleEllipsisText text={account.address} width={240} />
          </Box>
          <Box
            as="button"
            onClick={handleCopyAddress}
            p={1}
            borderRadius={12}
            _hover={{ backgroundColor: "#F5F5F5" }}
          >
            <IconCopy h={4} w={4} />
          </Box>
        </Flex>
      </Flex>
      <Box
        as="button"
        onClick={handleShowMore}
        p={1}
        borderRadius={13}
        _hover={{ backgroundColor: "#F5F5F5" }}
      >
        <IconMore />
      </Box>
    </Flex>
  );
};

const WalletDetailScreen = () => {
  const navigate = useNavigate();
  const { walletId = "" } = useParams();
  const { t } = useTranslation();
  const { addAccount, deleteWallet } = useWallets();

  const allWalletInfo = usePopupSelector(
    (state) => state.account.allWalletInfo,
  );

  const walletInfo = useMemo(
    () => allWalletInfo[walletId],
    [walletId, allWalletInfo],
  );

  const accountList: SelectedAccount[] = useMemo(() => {
    if (!walletInfo) return [];

    const list = walletInfo?.accountsMap[CoinType.ALEO] || [];
    return list.map((a) => ({
      ...a,
      walletId: walletId || "",
      coinType: CoinType.ALEO,
    }));
  }, [walletInfo?.accountsMap, walletId]);

  const onAddAccount = useCallback(() => {
    addAccount(walletId || "", CoinType.ALEO, nanoid());
  }, [addAccount, walletId]);

  const onBackupMnemonic = useCallback(async () => {
    const { confirmed } = await showPasswordVerifyDrawer();
    confirmed && navigate(`/backup_mnemonic/${walletId}`);
  }, [navigate, showPasswordVerifyDrawer]);

  const onExportSeedPhrase = useCallback(async () => {
    const { confirmed } = await showPasswordVerifyDrawer();
    confirmed && navigate(`/export_seed_phrase/${walletId}`);
  }, [navigate, showPasswordVerifyDrawer]);

  const onDeleteWallet = useCallback(async () => {
    try {
      if (!walletInfo) return;
      await deleteWallet(walletInfo.walletId);
      navigate(-1);
    } catch (e) {
      console.warn("delete wallet error " + e);
    }
  }, [deleteWallet, walletInfo?.walletId, navigate]);

  const onWalletMoreAction = useCallback(() => {
    showWalletOptionDrawer({
      wallet: walletInfo,
      onClickOption: async (option) => {
        switch (option) {
          case WalletOperateOption.BackupMnemonic:
            onBackupMnemonic();
            break;
          case WalletOperateOption.ExportPhrase:
            onExportSeedPhrase();
            break;
          case WalletOperateOption.Delete:
            onDeleteWallet();
            break;
          default:
            break;
        }
      },
    });
  }, [
    showWalletOptionDrawer,
    walletInfo,
    onBackupMnemonic,
    onDeleteWallet,
    onExportSeedPhrase,
  ]);

  const renderAccountItem = useCallback(
    (account: SelectedAccount, index: number) => {
      return (
        <AccountListItem
          key={`${account.accountId}${index}`}
          account={account}
        />
      );
    },
    [],
  );

  return (
    <PageWithHeader
      title={walletInfo?.walletName}
      rightIcon={
        <Box
          as="button"
          onClick={onWalletMoreAction}
          p={1}
          borderRadius={13}
          _hover={{ backgroundColor: "#F5F5F5" }}
        >
          <IconMore />
        </Box>
      }
    >
      <Flex direction={"column"} flex={1} px={5} pb={4} pt={2.5}>
        <Flex align={"center"} justify={"flex-start"}>
          <IconAleo />
          <Text ml={1} fontSize={14} fontWeight={500} color={"black"}>
            ALEO
          </Text>
        </Flex>
        <Flex direction={"column"} maxH={435} overflowY="auto">
          {accountList.map(renderAccountItem)}
        </Flex>
        <Button
          position={"absolute"}
          bottom={5}
          left={5}
          right={5}
          onClick={onAddAccount}
        >
          {t("Wallet:Manage:addAccount")}
        </Button>
      </Flex>
    </PageWithHeader>
  );
};

export default WalletDetailScreen;