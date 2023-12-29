import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import {
  IconAleo,
  IconCopy,
  IconEdit,
  IconMore,
} from "@/components/Custom/Icon";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showDeleteWalletWarningDialog } from "@/components/Wallet/DeleteWalletWarningDialog";
import { showEditAccountNameDrawer } from "@/components/Wallet/EditAccountNameDrawer";
import {
  WalletOperateOption,
  showEditWalletDrawer,
} from "@/components/Wallet/EditWalletDrawer";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import { PageWithHeader } from "@/layouts/Page";
import { SelectedAccount } from "@/scripts/background/store/vault/types/keyring";
import { Box, Button, Flex, Text, useClipboard } from "@chakra-ui/react";
import { CoinType } from "core/types";
import { isEqual } from "lodash";
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

  const handleEditName = useCallback(() => {
    showEditAccountNameDrawer({
      account,
    });
  }, [account]);

  const handleCopyAddress = useCallback(() => {
    showToast();
    onCopy();
  }, [onCopy, showToast]);

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
            color={"#000"}
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
        onClick={handleCopyAddress}
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
  const { selectedWallet } = useCurrWallet();
  const { addAccount, flattenWalletList } = useWallets();
  const dispatch = usePopupDispatch();

  const walletInfo = usePopupSelector((state) => {
    if (!walletId) {
      throw new Error("Wallet doesn't exists");
    }
    return state.account.allWalletInfo[walletId];
  }, isEqual);

  const accountList: SelectedAccount[] = useMemo(() => {
    if (!walletInfo) return [];

    const list = walletInfo?.accountsMap[CoinType.ALEO] || [];
    return list.map((a) => ({
      ...a,
      walletId: walletId || "",
      coinType: CoinType.ALEO,
    }));
  }, [walletInfo, walletId]);

  const onAddAccount = useCallback(() => {
    addAccount(walletId || "", CoinType.ALEO, nanoid());
  }, [addAccount, walletId]);

  const onDeleteWallet = useCallback(async () => {
    const { confirmed } = await showDeleteWalletWarningDialog();
    if (!confirmed) {
      return;
    }

    await dispatch.account.deleteWallet(walletId);
    if (selectedWallet.walletId !== walletId) {
      navigate(-1);
      return;
    }

    if (flattenWalletList.length > 1) {
      const nextWallet = flattenWalletList[0];
      const nextAccount = nextWallet.accountsMap[CoinType.ALEO][0];
      if (!nextAccount) {
        throw new Error("Wallet doesn't has any accounts");
      }
      dispatch.account.setSelectedAccount({
        selectedAccount: {
          ...nextAccount,
          walletId: nextWallet.walletId,
          coinType: CoinType.ALEO,
        },
      });
      navigate(-1);
    } else {
      // todo: clear data?
      dispatch.account.setSelectedAccount({
        selectedAccount: {
          accountId: "",
          accountName: "",
          address: "",
          index: 0,
          walletId: "",
          coinType: CoinType.ALEO,
        },
      });
      navigate("/onboard/home");
    }
  }, [dispatch.account, walletId, navigate, flattenWalletList]);

  const onWalletMoreAction = useCallback(() => {
    showEditWalletDrawer({
      wallet: walletInfo,
      onClickOption: async (option) => {
        switch (option) {
          case WalletOperateOption.BackupMnemonic:
            navigate(`/backup_mnemonic/${walletId}`);
            break;
          case WalletOperateOption.ExportPhrase:
            navigate(`/export_seed_phrase/${walletId}`);
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
    showEditWalletDrawer,
    walletInfo,
    navigate,
    walletId,
    dispatch.account,
    onDeleteWallet,
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
        <Flex
          direction={"column"}
          maxH={435}
          overflowY="auto"
          sx={{
            scrollbarWidth: "none",
            "::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
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
