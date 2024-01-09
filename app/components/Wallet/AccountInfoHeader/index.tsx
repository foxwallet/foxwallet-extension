import {
  IconArrowRight,
  IconCopy,
  IconEyeClose,
  IconEyeOn,
  IconLoading,
  IconLogo,
  IconReceive,
  IconSend,
} from "@/components/Custom/Icon";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Box, Flex, Text, keyframes, useClipboard } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import { useBalance } from "@/hooks/useBalance";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showWalletsDrawer } from "../WalletsDrawer";
import { useCurrWallet } from "@/hooks/useWallets";
import { useTranslation } from "react-i18next";
import RescanButton from "../RescanButton";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useIsSendingAleoTx } from "@/hooks/useSendingTxStatus";

const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

export const AccountInfoHeader = () => {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
    4000,
  );
  const { selectedWallet } = useCurrWallet();
  const { t } = useTranslation();
  const showBalance = usePopupSelector((state) => state.account.showBalance);
  const dispatch = usePopupDispatch();
  const { showToast } = useCopyToast();
  const { onCopy } = useClipboard(selectedAccount.address);
  const { sendingAleoTx } = useIsSendingAleoTx(uniqueId);

  const options: ActionButtonProps[] = useMemo(
    () => [
      {
        title: t("Receive:title"),
        icon: <IconReceive />,
        onPress: () => navigate("/receive"),
      },
      {
        title: t("Send:title"),
        icon: <IconSend />,
        disabled: sendingAleoTx || loadingBalance || !balance?.total,
        onPress: () => navigate("/send_aleo"),
      },
    ],
    [navigate, t, sendingAleoTx],
  );

  const onChangeWallet = useCallback(() => {
    showWalletsDrawer({
      onManageWallet: () => navigate("/wallet_list"),
    });
  }, [showWalletsDrawer, navigate]);

  const onCopyAddress = useCallback(() => {
    onCopy();
    showToast();
  }, [showToast, onCopy]);

  const renderActionItem = useCallback(
    (item: ActionButtonProps, index: number) => {
      return <ActionButton key={`${item.title}${index}`} {...item} />;
    },
    [],
  );

  return (
    <Box
      w="100%"
      px={5}
      py={5}
      bgGradient="linear(to-br, #ECFFF2, #FFFFFF, #ECFFF2)"
      borderBottomWidth={1}
      borderColor={"#E6E8EC"}
    >
      <Flex justify={"space-between"} align={"center"}>
        <Flex
          cursor={"pointer"}
          onClick={onChangeWallet}
          direction={"row"}
          align={"center"}
        >
          <IconLogo w={8} h={8} mr={1} />
          <Flex direction={"column"} align={"flex-start"}>
            <Text fontSize={12} lineHeight={4} color={"#000"} fontWeight={500}>
              {selectedWallet?.walletName}
            </Text>
            <Text fontSize={10} color={"#777E90"} fontWeight={500}>
              {selectedAccount.accountName}
            </Text>
          </Flex>
          <IconArrowRight w={18} h={18} />
        </Flex>
        {!!sendingAleoTx && (
          <Flex
            bgColor={"green.50"}
            p={2}
            borderRadius={"lg"}
            justify={"center"}
            align={"center"}
            onClick={() => navigate(`/token_detail/${uniqueId}`)}
          >
            <IconLoading
              w={4}
              h={4}
              mr={1}
              stroke={"green.600"}
              animation={`${rotateAnimation} infinite 2s linear`}
            />
            <Text color={"green.600"} fontSize={"smaller"}>
              {t("Send:sendingAleoTx")}
            </Text>
          </Flex>
        )}
      </Flex>
      <Flex mt={6} direction={"row"} align={"center"}>
        <Box maxW={128} noOfLines={1} fontSize={11} color={"#777E90"}>
          <MiddleEllipsisText text={selectedAccount.address} width={128} />
        </Box>
        <Flex
          justify={"center"}
          align={"center"}
          cursor={"pointer"}
          px={2}
          onClick={onCopyAddress}
        >
          <IconCopy w={3} h={3} />
        </Flex>
      </Flex>
      <Flex direction={"row"} align={"center"} justify={"space-between"} mt={2}>
        <Flex align={"center"}>
          <Box fontSize={24} fontWeight={600}>
            {showBalance ? (
              <TokenNum
                amount={balance?.total}
                decimals={nativeCurrency.decimals}
                symbol={nativeCurrency.symbol}
              />
            ) : (
              "*****"
            )}
          </Box>
          <Box
            cursor={"pointer"}
            ml={1}
            onClick={() => dispatch.account.changeBalanceState()}
          >
            {!showBalance ? (
              <IconEyeOn w={4} h={4} />
            ) : (
              <IconEyeClose w={4} h={4} />
            )}
          </Box>
        </Flex>
        <RescanButton paused={!!sendingAleoTx} />
      </Flex>
      <Flex direction={"row"} align={"center"} justify={"space-around"} mt={6}>
        {options.map(renderActionItem)}
      </Flex>
    </Box>
  );
};

interface ActionButtonProps {
  title: string;
  icon: any;
  disabled?: boolean;
  onPress: () => void;
}
const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon,
  disabled = false,
  onPress,
}) => {
  return (
    <Flex
      cursor={"pointer"}
      onClick={!disabled ? onPress : undefined}
      align={"center"}
      direction={"column"}
    >
      {icon}
      <Text
        mt={1}
        fontSize={12}
        fontWeight={500}
        color={disabled ? "gray" : "#000"}
      >
        {title}
      </Text>
    </Flex>
  );
};
