import { PageWithHeader } from "@/layouts/Page";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import {
  DisplayAccount,
  DisplayWallet,
  SelectedAccount,
} from "@/scripts/background/store/vault/types/keyring";
import { useTranslation } from "react-i18next";
import { IconCheckLineBlack } from "@/components/Custom/Icon";
import { showEditWalletNameDrawer } from "@/components/Wallet/EditWalletNameDrawer";
import { usePopupDispatch } from "@/hooks/useStore";
import { CoinType } from "core/types";

interface WalletListItemProps {
  wallet: DisplayWallet;
  isSelected: boolean;
  onSelected: (wallet: DisplayWallet) => void;
  onCheckAccounts: (wallet: DisplayWallet) => void;
}
const WalletListItem: React.FC<WalletListItemProps> = ({
  wallet,
  isSelected,
  onSelected,
  onCheckAccounts,
}) => {
  const { t } = useTranslation();

  const handleSelected = useCallback(() => {
    onSelected(wallet);
  }, []);

  const handleCheckAccounts = useCallback(() => {
    onCheckAccounts(wallet);
  }, [wallet, onCheckAccounts]);

  return (
    <Flex
      mt={2.5}
      borderWidth={1}
      borderColor={isSelected ? "#000" : "#E6E8EC"}
      borderRadius={8}
      position={"relative"}
    >
      <Flex
        pl={2.5}
        pr={2}
        flex={1}
        minH={"38px"}
        align={"center"}
        as={"button"}
        onClick={handleSelected}
      >
        {isSelected ? (
          <IconCheckLineBlack height={18} width={18} />
        ) : (
          <Box height={18} width={18} />
        )}
        <Text
          ml={1}
          fontSize={12}
          fontWeight={500}
          color={"#000"}
          align={"start"}
        >
          {wallet.walletName}
        </Text>
      </Flex>
      <Text
        position={"absolute"}
        right={2.5}
        alignSelf={"center"}
        fontSize={10}
        color={"#777E90"}
        as={"button"}
        onClick={handleCheckAccounts}
        px={0.5}
        borderRadius={"4px"}
        _hover={{ backgroundColor: "#F5F5F5" }}
      >
        {t("Wallet:Manage:checkAccounts")}
      </Text>
    </Flex>
  );
};

function ManageWalletScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedWallet } = useCurrWallet();
  const { flattenWalletList } = useWallets();
  const dispatch = usePopupDispatch();

  const onSelectWallet = useCallback(
    (wallet: DisplayWallet) => {
      if (wallet.walletId !== selectedWallet.walletId) {
        const account: DisplayAccount | undefined = (
          wallet.accountsMap[CoinType.ALEO] || []
        ).find((a) => !a.hide);

        if (account) {
          dispatch.account.setSelectedAccount({
            selectedAccount: {
              ...account,
              walletId: wallet.walletId,
              coinType: CoinType.ALEO,
            },
          });
        }
      }
      navigate(-1);
    },
    [dispatch.account, navigate],
  );

  const onCheckAccounts = useCallback((wallet: DisplayWallet) => {
    navigate(`/wallet_detail/${wallet.walletId}`);
  }, []);

  const onEdit = useCallback(() => {
    showEditWalletNameDrawer();
  }, [showEditWalletNameDrawer]);

  const renderWalletItem = useCallback(
    (wallet: DisplayWallet, index: number) => {
      const isSelected = selectedWallet?.walletId === wallet.walletId;
      return (
        <WalletListItem
          key={`${wallet.walletId}${index}`}
          wallet={wallet}
          isSelected={isSelected}
          onSelected={onSelectWallet}
          onCheckAccounts={onCheckAccounts}
        />
      );
    },
    [selectedWallet?.walletId],
  );

  return (
    <PageWithHeader
      enableBack
      title={t("Wallet:title")}
      rightIcon={
        <Box mr={2} fontSize={12} fontWeight={500} as="button" onClick={onEdit}>
          {t("Common:edit")}
        </Box>
      }
    >
      <Flex direction={"column"} flex={1} px={5} pb={4}>
        <Flex direction={"column"} maxH={470} overflowY="auto">
          {flattenWalletList.map(renderWalletItem)}
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
