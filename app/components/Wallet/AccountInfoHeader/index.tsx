import {
  IconArrowRight,
  IconBuyDisabled,
  IconCopy,
  IconEyeClose,
  IconEyeOn,
  IconLogo,
  IconReceive,
  IconSend,
  IconSwapDisabled,
} from "@/components/Custom/Icon";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Box, Flex, Text, useClipboard, useToast } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import { useBalance } from "@/hooks/useBalance";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AccountInfoHeader = () => {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance } = useBalance(uniqueId, selectedAccount.address, 4000);

  const { onCopy } = useClipboard(selectedAccount.address);
  const toast = useToast();
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
      {
        title: "Buy",
        icon: <IconBuyDisabled />,
        disabled: true,
        onPress: () => {},
      },
      {
        title: "Swap",
        icon: <IconSwapDisabled />,
        disabled: true,
        onPress: () => {},
      },
    ],
    [navigate],
  );

  const onCopyAddress = useCallback(() => {
    onCopy();
    toast({
      title: "Account created.",
      description: "We've created your account for you.",
      status: "success",
      duration: 1000,
      isClosable: true,
    });
  }, [toast, onCopy]);

  const renderActionItem = useCallback((item: ActionButtonProps) => {
    return <ActionButton {...item} />;
  }, []);

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
        onClick={() => alert("test")}
        as={"button"}
        direction={"row"}
        align={"center"}
      >
        <IconLogo w={8} h={8} mr={1} />
        <Flex direction={"column"} align={"flex-start"}>
          <Text fontSize={12} lineHeight={4} color={"#000"} fontWeight={500}>
            {selectedAccount.accountName}
          </Text>
          <Text fontSize={10} color={"#777E90"} fontWeight={500}>
            Aleo testnet
          </Text>
        </Flex>
        <IconArrowRight w={18} h={18} />
      </Flex>
      <Flex mt={6} direction={"row"} align={"center"}>
        <Text
          maxW={128}
          noOfLines={1}
          fontSize={11}
          color={"#777E90"}
          textOverflow={"ellipsis"}
        >
          {selectedAccount.address}
        </Text>
        <Box ml={1} as="button" onClick={onCopyAddress}>
          <IconCopy w={3} h={3} />
        </Box>
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
      <Flex direction={"row"} align={"center"} justify={"space-between"} mt={6}>
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
