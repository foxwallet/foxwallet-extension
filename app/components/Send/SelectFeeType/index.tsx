import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
} from "@chakra-ui/react";
import { L1, P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useMemo } from "react";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { type Balance } from "@/hooks/useBalance";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { type NativeToken } from "core/types/Token";
import { TokenNum } from "@/components/Wallet/TokenNum";
import {
  IconCheckCircle,
  IconCheckCircleBlack,
  IconCheckLine,
  IconUncheckCircleGray,
} from "@/components/Custom/Icon";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onConfirm: (data?: RecordDetailWithSpent) => void;
  onCancel: () => void;
  balance?: Balance;
  selectedFeeMethod: AleoFeeMethod;
  selectedFeeRecord?: RecordDetailWithSpent;
  recordList: RecordDetailWithSpent[];
  nativeCurrency: NativeToken;
}

const SelectFeeTypeDrawer = (props: Props) => {
  const {
    isOpen,
    onConfirm,
    onCancel,
    balance,
    selectedFeeMethod,
    selectedFeeRecord,
    recordList,
    nativeCurrency,
  } = props;
  const { t } = useTranslation();

  const feeMethodMap = useMemo(() => {
    return {
      [AleoFeeMethod.FEE_PUBLIC]: t("Send:publicFee"),
      [AleoFeeMethod.FEE_PRIVATE]: t("Send:privateFee"),
    };
  }, [t]);

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onCancel}>
      <DrawerOverlay />
      <DrawerContent bg={"white"} px="6" py="4">
        <DrawerCloseButton position={"absolute"} top={6} right={6} />
        <DrawerHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          {t("Send:selectFeeMethod")}
        </DrawerHeader>
        <DrawerBody>
          <Flex
            bgColor={"green.50"}
            px={4}
            py={2}
            borderRadius={"lg"}
            mt={2}
            fontSize={"smaller"}
          >
            <Text>{t("Send:feeHint")}</Text>
          </Flex>
          <Flex direction={"column"}>
            <Flex
              key={AleoFeeMethod.FEE_PUBLIC}
              mt="2"
              px={"4"}
              py={"3"}
              border="1.5px solid"
              borderColor={
                selectedFeeMethod === AleoFeeMethod.FEE_PUBLIC
                  ? "black"
                  : "gray.50"
              }
              borderRadius={"lg"}
              justify={"space-between"}
              align={"center"}
              onClick={() => {
                onConfirm();
              }}
            >
              <Flex align={"center"}>
                {selectedFeeMethod === AleoFeeMethod.FEE_PUBLIC ? (
                  <IconCheckCircleBlack w={4} h={4} />
                ) : (
                  <IconUncheckCircleGray w={4} h={4} />
                )}
                <Text ml="1">{feeMethodMap[AleoFeeMethod.FEE_PUBLIC]}</Text>
              </Flex>
              <TokenNum
                amount={balance?.publicBalance ?? 0n}
                decimals={nativeCurrency.decimals}
                symbol={nativeCurrency.symbol}
              />
            </Flex>
            <Flex
              key={AleoFeeMethod.FEE_PRIVATE}
              mt="2"
              px={"4"}
              py={"3"}
              border="1.5px solid"
              borderColor={
                selectedFeeMethod === AleoFeeMethod.FEE_PRIVATE
                  ? "black"
                  : "gray.50"
              }
              borderRadius={"lg"}
              justify={"space-between"}
              align={"center"}
              onClick={() => {
                onConfirm(selectedFeeRecord ?? recordList[0]);
              }}
            >
              <Flex align={"center"}>
                {selectedFeeMethod === AleoFeeMethod.FEE_PRIVATE ? (
                  <IconCheckCircleBlack w={4} h={4} />
                ) : (
                  <IconUncheckCircleGray w={4} h={4} />
                )}
                <Text ml="1">{feeMethodMap[AleoFeeMethod.FEE_PRIVATE]}</Text>
              </Flex>
              <TokenNum
                amount={balance?.privateBalance ?? 0n}
                decimals={nativeCurrency.decimals}
                symbol={nativeCurrency.symbol}
              />
            </Flex>
            <Flex fontWeight={"semibold"} mt={4}>
              <Text>{t("Send:commitment")}</Text>
              <Text ml={"auto"}>{t("Send:amount")}</Text>
            </Flex>
            <Flex direction={"column"} maxH={"250px"} overflowY={"auto"} pb={8}>
              {recordList.map((record, i) => (
                <Flex
                  key={record.commitment}
                  flex={1}
                  mt="1"
                  pt={"3"}
                  pb={"2"}
                  borderBottom="1px solid"
                  borderColor={"gray.100"}
                  onClick={() => {
                    onConfirm(record);
                  }}
                  justifyContent={"space-between"}
                >
                  <Flex align={"center"}>
                    {selectedFeeMethod === AleoFeeMethod.FEE_PRIVATE &&
                    selectedFeeRecord?.commitment === record.commitment ? (
                      <IconCheckCircleBlack w={4} h={4} mr={1} />
                    ) : (
                      <IconUncheckCircleGray w={4} h={4} mr={1} />
                    )}
                    <MiddleEllipsisText
                      text={record.commitment.slice(0, -5)}
                      width={150}
                    />
                  </Flex>

                  <TokenNum
                    amount={record.parsedContent?.microcredits || 0n}
                    decimals={nativeCurrency.decimals}
                    symbol={nativeCurrency.symbol}
                  />
                </Flex>
              ))}
            </Flex>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const showSelectFeeTypeDialog =
  promisifyChooseDialogWrapper(SelectFeeTypeDrawer);
