import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { L1, P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useMemo } from "react";
import { useBalance } from "@/hooks/useBalance";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useCoinService } from "@/hooks/useCoinService";
import { IconCheckLine } from "@/components/Custom/Icon";
import { useRecords } from "@/hooks/useRecord";
import { useTranslation } from "react-i18next";
import { Token } from "core/coins/ALEO/types/Token";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";
import { NATIVE_TOKEN_TOKEN_ID } from "core/coins/ALEO/constants";

interface Props {
  isOpen: boolean;
  selectedMethod: AleoTransferMethod;
  uniqueId: ChainUniqueId;
  address: string;
  token: Token;
  onConfirm: (data: AleoTransferMethod) => void;
  onCancel: () => void;
}

const SelectTransferMethodDrawer = (props: Props) => {
  const {
    isOpen,
    onConfirm,
    onCancel,
    uniqueId,
    address,
    selectedMethod,
    token,
  } = props;
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address,
    tokenId: token.tokenId,
    refreshInterval: 10000,
  });
  const { records, loading: loadingRecords } = useRecords({
    uniqueId,
    address,
    recordFilter: RecordFilter.UNSPENT,
    programId: token.programId,
  });

  const tokenRecords = useMemo(() => {
    if (token.tokenId === NATIVE_TOKEN_TOKEN_ID) {
      return records;
    }
    return records.filter((record) => {
      return record.parsedContent?.token === token.tokenId;
    });
  }, [records, token]);

  const { t } = useTranslation();

  const recordStr = useMemo(() => {
    if (!tokenRecords) {
      return "";
    }
    if (tokenRecords.length === 0) {
      return t("Send:noRecordExist");
    }
    return t("Send:recordStatistics", { COUNT: tokenRecords.length });
  }, [tokenRecords]);

  const transferMethods = useMemo(() => {
    return Object.values(AleoTransferMethod);
  }, []);

  const transferMethodMap = useMemo(() => {
    return {
      [AleoTransferMethod.PUBLIC]: {
        title: t("Send:publicTransfer"),
        description: t("Send:publicTransferDesc"),
      },
      [AleoTransferMethod.PUBLIC_TO_PRIVATE]: {
        title: t("Send:publicToPrivate"),
        description: t("Send:publicToPrivateDesc"),
      },
      [AleoTransferMethod.PRIVATE]: {
        title: t("Send:privateTransfer"),
        description: t("Send:privateTransferDesc"),
      },
      [AleoTransferMethod.PRIVATE_TO_PUBLIC]: {
        title: t("Send:privateToPublic"),
        description: t("Send:privateToPublicDesc"),
      },
    };
  }, [t]);

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onCancel}>
      <DrawerOverlay />
      <DrawerContent bg={"white"} px="6" py="4">
        <DrawerCloseButton position={"absolute"} top={5} right={6} />
        <DrawerHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          fontWeight={"semibold"}
        >
          {t("Send:selectTransferMethod")}
        </DrawerHeader>
        <DrawerBody>
          <Flex flexDir={"column"} pt={2} mt={3} fontSize={"smaller"}>
            <Flex justify={"space-between"}>
              <Text color={"gray.500"}>{t("Send:publicBalance")}</Text>
              {loadingBalance ? (
                <Spinner w={2} h={2} />
              ) : (
                <TokenNum
                  amount={balance?.publicBalance || 0n}
                  decimals={token.decimals}
                  symbol={token.symbol}
                />
              )}
            </Flex>
            <Flex justify={"space-between"} mt={2}>
              <Text color={"gray.500"}>{t("Send:privateRecord")}</Text>
              <Flex flexDir={"column"} align={"flex-end"}>
                {loadingBalance ? (
                  <Spinner w={2} h={2} />
                ) : (
                  <TokenNum
                    amount={balance?.privateBalance || 0n}
                    decimals={token.decimals}
                    symbol={token.symbol}
                  />
                )}
                {!!recordStr && !!tokenRecords[0] && (
                  <Flex>
                    (<Text>{recordStr}</Text>&nbsp;
                    <TokenNum
                      amount={
                        token.tokenId
                          ? BigInt(tokenRecords[0].parsedContent?.amount) || 0n
                          : tokenRecords[0].parsedContent?.microcredits || 0n
                      }
                      decimals={token.decimals}
                      symbol={token.symbol}
                    />
                    )
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
          <Flex direction={"column"}>
            {transferMethods.map((method) => (
              <Flex flexDir={"column"}>
                <Flex
                  key={method}
                  flex={1}
                  mt="4"
                  px={4}
                  py={3}
                  border="1px solid"
                  borderColor={selectedMethod === method ? "black" : "gray.100"}
                  borderRadius={"lg"}
                  onClick={() => onConfirm(method)}
                  justify={"space-between"}
                >
                  <Text>{transferMethodMap[method].title}</Text>
                  {selectedMethod === method && (
                    <IconCheckLine w={"5"} h={"full"} stroke={"black"} />
                  )}
                </Flex>
                <Text fontSize={"smaller"} color={"gray.500"}>
                  {transferMethodMap[method].description}
                </Text>
              </Flex>
            ))}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const showSelectTransferMethodDialog = promisifyChooseDialogWrapper(
  SelectTransferMethodDrawer,
);
