import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
} from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { NativeToken } from "core/types/Token";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import {
  IconCheckCircleBlack,
  IconUncheckCircleGray,
} from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { Token } from "core/coins/ALEO/types/Token";

interface Props {
  isOpen: boolean;
  onConfirm: (data: RecordDetailWithSpent) => void;
  onCancel: () => void;
  selectedRecord?: RecordDetailWithSpent;
  recordList: RecordDetailWithSpent[];
  token: Token;
}

const SelectRecordDrawer = (props: Props) => {
  const { isOpen, onConfirm, onCancel, recordList, token, selectedRecord } =
    props;
  const { t } = useTranslation();

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onCancel}>
      <DrawerOverlay />
      <DrawerContent bg={"white"} px="6" py="4">
        <DrawerCloseButton position={"absolute"} top={5} right={6} />
        <DrawerHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          fontWeight={"bold"}
        >
          {t("Send:selectRecord")}
        </DrawerHeader>
        <DrawerBody mt={2}>
          <Flex fontWeight={"semibold"}>
            <Text>{t("Send:commitment")}</Text>
            <Text ml={"auto"}>{t("Send:amount")}</Text>
          </Flex>
          <Flex direction={"column"} maxH={"400px"} overflowY={"auto"} pb={8}>
            {recordList.map((record, i) => (
              <Flex
                key={record.commitment}
                flex={1}
                mt="1"
                pt={"3"}
                pb={"2"}
                borderBottom="1px solid"
                borderColor={"gray.100"}
                onClick={() => onConfirm(record)}
                justifyContent={"space-between"}
              >
                <Flex align={"center"}>
                  {selectedRecord?.commitment === record.commitment ? (
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
                  decimals={token.decimals}
                  symbol={token.symbol}
                />
              </Flex>
            ))}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const showSelectRecordDialog =
  promisifyChooseDialogWrapper(SelectRecordDrawer);
