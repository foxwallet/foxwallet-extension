import Hover from "@/components/Custom/Hover";
import { IconArrowRight, IconEdit, IconMore } from "@/components/Custom/Icon";
import { showPasswordVerifyDrawer } from "@/components/Custom/PasswordVerifyDrawer";
import { showEditAccountNameDrawer } from "@/components/Wallet/EditAccountNameDrawer";
import {
  WalletOperateOption,
  showWalletOptionDrawer,
} from "@/components/Wallet/WalletOptionDrawer";
import { usePopupSelector } from "@/hooks/useStore";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useWallets } from "@/hooks/useWallets";
import { PageWithHeader } from "@/layouts/Page";
import {
  type OneMatchGroupAccount,
  WalletType,
} from "@/scripts/background/store/vault/types/keyring";
import { Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { nanoid } from "nanoid";
import type React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";
import { serializeData } from "@/common/utils/string";

interface AccountListItemProps {
  account: OneMatchGroupAccount;
}
const AccountListItem: React.FC<AccountListItemProps> = ({ account }) => {
  const navigate = useNavigate();

  const handleEditName = useCallback(() => {
    void showEditAccountNameDrawer({
      account,
    });
  }, [account]);

  const handleShowMore = useCallback(() => {
    navigate(`/account_more/${serializeData(account)}`);
  }, [account, navigate]);

  const titleColor = useColorModeValue("black", "white");
  const { borderColor } = useThemeStyle();
  return (
    <Flex
      mt={2.5}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius={8}
      px={2.5}
      flex={1}
      minH={"60px"}
      align={"center"}
      justifyContent={"space-between"}
      onClick={handleShowMore}
      cursor={"pointer"}
    >
      <Flex direction={"column"}>
        <Flex align={"center"}>
          <Text
            mr={1}
            fontSize={13}
            fontWeight={"bold"}
            color={titleColor}
            align={"start"}
          >
            {account.group.groupName}
          </Text>
          <Flex
            onClick={(event) => {
              event.stopPropagation();
              handleEditName();
            }}
          >
            <Hover p={1}>
              <IconEdit />
            </Hover>
          </Flex>
        </Flex>
      </Flex>
      <Hover onClick={handleShowMore} p={1}>
        <IconArrowRight />
      </Hover>
    </Flex>
  );
};

const WalletDetailScreen = () => {
  const navigate = useNavigate();
  const { walletId = "" } = useParams();
  const { t } = useTranslation();
  const { addAccount, deleteWallet } = useWallets();

  const allWalletInfo = usePopupSelector(
    (state) => state.accountV2.allWalletInfo,
  );

  const walletInfo = useMemo(
    () => allWalletInfo[walletId],
    [walletId, allWalletInfo],
  );

  const accountList: OneMatchGroupAccount[] = useMemo(() => {
    if (!walletInfo) return [];
    const { groupAccounts, ...restWallet } = walletInfo;
    return groupAccounts.map((a) => ({
      wallet: restWallet,
      group: a,
    }));
  }, [walletInfo]);

  const onAddAccount = useCallback(() => {
    void addAccount(walletId || "", nanoid());
  }, [addAccount, walletId]);

  const onBackupMnemonic = useCallback(async () => {
    const { confirmed } = await showPasswordVerifyDrawer();
    confirmed && navigate(`/backup_mnemonic/${walletId}`);
  }, [navigate, walletId]);

  const onExportSeedPhrase = useCallback(async () => {
    const { confirmed } = await showPasswordVerifyDrawer();
    confirmed && navigate(`/export_seed_phrase/${walletId}`);
  }, [navigate, walletId]);

  const onDeleteWallet = useCallback(async () => {
    try {
      if (!walletInfo) return;
      const newWallets = await deleteWallet(walletInfo.walletId);
      if (newWallets.length === 0) {
        navigate("/onboard/home");
      } else {
        navigate(-1);
      }
    } catch (e) {
      console.warn("delete wallet error ", e);
    }
  }, [walletInfo, deleteWallet, navigate]);

  const onWalletMoreAction = useCallback(() => {
    void showWalletOptionDrawer({
      wallet: walletInfo,
      onClickOption: (option) => {
        switch (option) {
          case WalletOperateOption.BackupMnemonic:
            void onBackupMnemonic();
            break;
          case WalletOperateOption.ExportPhrase:
            void onExportSeedPhrase();
            break;
          case WalletOperateOption.Delete:
            void onDeleteWallet();
            break;
          default:
            break;
        }
      },
    });
  }, [walletInfo, onBackupMnemonic, onDeleteWallet, onExportSeedPhrase]);

  const renderAccountItem = useCallback(
    (account: OneMatchGroupAccount, index: number) => {
      return (
        <AccountListItem
          key={`${account.group.groupId}${index}`}
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
        <Hover onClick={onWalletMoreAction}>
          <IconMore />
        </Hover>
      }
    >
      <Flex direction={"column"} flex={1} px={5} pb={4} pt={2.5}>
        <Flex
          direction={"column"}
          maxH={435}
          overflowY="auto"
          sx={HIDE_SCROLL_BAR_CSS}
        >
          {accountList.map(renderAccountItem)}
        </Flex>
        {walletInfo?.walletType === WalletType.HD && (
          <Button
            position={"absolute"}
            bottom={5}
            left={5}
            right={5}
            onClick={onAddAccount}
          >
            {t("Wallet:Manage:addAccount")}
          </Button>
        )}
      </Flex>
    </PageWithHeader>
  );
};

export default WalletDetailScreen;
