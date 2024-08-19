import { PageWithHeader } from "@/layouts/Page";
import { Box, Button, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { SyntheticEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import {
  DisplayGroupAccount,
  DisplayWallet,
} from "@/scripts/background/store/vault/types/keyring";
import { useTranslation } from "react-i18next";
import {
  IconCheckLineBlack,
  IconDelete,
  IconEdit,
  IconLogo,
} from "@/components/Custom/Icon";
import { usePopupDispatch } from "@/hooks/useStore";
import { CoinType } from "core/types";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import Hover from "@/components/Custom/Hover";
import { showEditWalletNameDrawer } from "@/components/Wallet/EditWalletNameDrawer";

interface WalletItemProps {
  wallet: DisplayWallet;
  isSelected: boolean;
  isEditing: boolean;
  onSelected: (wallet: DisplayWallet) => void;
  onDelete: (wallet: DisplayWallet) => void;
}
const WalletItem: React.FC<WalletItemProps> = ({
  wallet,
  isSelected,
  isEditing,
  onSelected,
  onDelete,
}) => {
  const handleSelected = useCallback(() => {
    if (isEditing) return;
    onSelected(wallet);
  }, [onSelected, wallet, isEditing]);

  const handleDelete = useCallback(() => {
    onDelete(wallet);
  }, [onDelete, wallet]);

  const handleEditName = useCallback(
    (event: SyntheticEvent) => {
      showEditWalletNameDrawer({ wallet });
      event.stopPropagation();
    },
    [showEditWalletNameDrawer, wallet],
  );

  const { borderColor, selectedBorderColor } = useThemeStyle();

  return (
    <Flex
      mt={2.5}
      px={2.5}
      borderWidth={1}
      borderColor={isSelected ? selectedBorderColor : borderColor}
      borderRadius={8}
      justify={"space-between"}
      align={"center"}
      cursor={"pointer"}
    >
      <Flex
        pr={2}
        flex={1}
        minH={"52px"}
        align={"center"}
        onClick={handleSelected}
      >
        {isEditing && (
          <Box mr={2.5} cursor={"pointer"} onClick={handleDelete}>
            <IconDelete w={18} h={18} />
          </Box>
        )}
        <IconLogo mr={2.5} h={30} w={30} />
        <Text fontSize={13} fontWeight={500} align={"start"}>
          {wallet.walletName}
        </Text>
        <Hover p={1} onClick={handleEditName}>
          <IconEdit />
        </Hover>
      </Flex>
      {isSelected ? (
        <IconCheckLineBlack height={18} width={18} />
      ) : (
        <Box height={18} width={18} />
      )}
    </Flex>
  );
};

function ManageWalletScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedWallet } = useCurrWallet();
  const { walletList, deleteWallet } = useWallets();
  const dispatch = usePopupDispatch();
  const { isOpen, onToggle } = useDisclosure();

  const onSelectWallet = useCallback(
    (wallet: DisplayWallet) => {
      if (wallet.walletId !== selectedWallet?.walletId) {
        const { groupAccounts, ...restWallet } = wallet;
        const account: DisplayGroupAccount | undefined =
          wallet.groupAccounts[0];

        if (account) {
          dispatch.accountV2.setSelectedGroupAccount({
            selectedGroupAccount: {
              wallet: restWallet,
              group: account,
            },
          });
        }
      }
      navigate(-1);
    },
    [dispatch.accountV2, navigate],
  );

  const onDeleteWallet = useCallback(
    async (wallet: DisplayWallet) => {
      try {
        const newWallets = await deleteWallet(wallet.walletId);
        if (newWallets.length === 0) {
          navigate("/onboard/home");
        }
      } catch (e) {
        console.warn("delete wallet error " + e);
      }
    },
    [deleteWallet, navigate],
  );

  const renderWalletItem = useCallback(
    (wallet: DisplayWallet, index: number) => {
      const isSelected = selectedWallet?.walletId === wallet.walletId;
      return (
        <WalletItem
          key={`${wallet.walletId}${index}`}
          wallet={wallet}
          isSelected={isSelected}
          isEditing={isOpen}
          onSelected={onSelectWallet}
          onDelete={onDeleteWallet}
        />
      );
    },
    [selectedWallet?.walletId, isOpen],
  );

  return (
    <PageWithHeader
      enableBack
      title={t("Wallet:Manage:title")}
      rightIcon={
        <Box
          mr={2}
          fontSize={12}
          fontWeight={500}
          cursor={"pointer"}
          onClick={onToggle}
        >
          {isOpen ? t("Common:done") : t("Common:edit")}
        </Box>
      }
    >
      <Flex direction={"column"} flex={1} px={5} pb={4}>
        <Flex direction={"column"} maxH={470} overflowY="auto">
          {walletList.map(renderWalletItem)}
        </Flex>
        <Button
          position={"absolute"}
          bottom={5}
          left={5}
          right={5}
          onClick={() => navigate("/create_wallet")}
        >
          {t("Wallet:Manage:addWallet")}
        </Button>
      </Flex>
    </PageWithHeader>
  );
}

export default ManageWalletScreen;
