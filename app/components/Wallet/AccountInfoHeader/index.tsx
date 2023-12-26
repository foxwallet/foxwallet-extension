import {
  IconArrowRight,
  IconCopy,
  IconEyeClose,
  IconEyeOn,
  IconLogo,
  IconReceive,
  IconSend,
} from "@/components/Custom/Icon";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Box, Flex, Text, useClipboard } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import { useBalance } from "@/hooks/useBalance";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showWalletsDrawer } from "../WalletsDrawer";
import { useCurrWallet } from "@/hooks/useWallets";

export const AccountInfoHeader = () => {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance } = useBalance(uniqueId, selectedAccount.address, 4000);
  const { walletInfo } = useCurrWallet();

  const { showToast } = useCopyToast();
  const { onCopy } = useClipboard(selectedAccount.address);
  const [showBalance, setShowBalance] = useState(true);

  const options: ActionButtonProps[] = useMemo(
    () => [
      {
        title: "Receive",
        icon: <IconReceive />,
        onPress: () => navigate("/receive"),
      },
      {
        title: "Send",
        icon: <IconSend />,
        onPress: () => navigate("/send_aleo"),
      },
    ],
    [navigate],
  );

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
      <Flex
        onClick={() => showWalletsDrawer()}
        as={"button"}
        direction={"row"}
        align={"center"}
      >
        <IconLogo w={8} h={8} mr={1} />
        <Flex direction={"column"} align={"flex-start"}>
          <Text fontSize={12} lineHeight={4} color={"#000"} fontWeight={500}>
            {walletInfo?.walletName}
          </Text>
          <Text fontSize={10} color={"#777E90"} fontWeight={500}>
            {selectedAccount.accountName}
          </Text>
        </Flex>
        <IconArrowRight w={18} h={18} />
      </Flex>
      <Flex mt={6} direction={"row"} align={"center"}>
        <Text maxW={128} noOfLines={1} fontSize={11} color={"#777E90"}>
          <MiddleEllipsisText text={selectedAccount.address} width={128} />
        </Text>
        <Flex
          justify={"center"}
          align={"center"}
          as="button"
          px={2}
          onClick={onCopyAddress}
        >
          <IconCopy w={3} h={3} />
        </Flex>
      </Flex>
      <Flex direction={"row"} align={"center"} mt={2}>
        <Text fontSize={24} fontWeight={600}>
          {showBalance ? (
            <TokenNum
              amount={balance?.total || 0n}
              decimals={nativeCurrency.decimals}
              symbol={nativeCurrency.symbol}
            />
          ) : (
            "*****"
          )}
        </Text>
        <Box as="button" ml={1} onClick={() => setShowBalance((prev) => !prev)}>
          {showBalance ? (
            <IconEyeOn w={4} h={4} />
          ) : (
            <IconEyeClose w={4} h={4} />
          )}
        </Box>
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
    <Flex as="button" onClick={onPress} align={"center"} direction={"column"}>
      {icon}
      <Text fontSize={10} fontWeight={500} color={disabled ? "gray" : "#000"}>
        {title}
      </Text>
    </Flex>
  );
};
