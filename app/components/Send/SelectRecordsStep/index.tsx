import {
  IconCheckCircleBlack,
  IconUncheckCircleGray,
} from "@/components/Custom/Icon";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { Content } from "@/layouts/Content";
import { Flex, Text } from "@chakra-ui/react";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { type NativeToken } from "core/types/Token";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type SelectRecordsStepProps = {
  limit: number;
  records: RecordDetailWithSpent[];
  nativeCurrency: NativeToken;
  onConfirm: (records: RecordDetailWithSpent[]) => void;
};

export const SelectRecordsStep = (props: SelectRecordsStepProps) => {
  const { t } = useTranslation();
  const { limit, onConfirm, records, nativeCurrency } = props;
  const [selectedRecords, setSelectedRecords] = useState<
    RecordDetailWithSpent[]
  >([]);
  const onSelectedRecords = useCallback((record: RecordDetailWithSpent) => {
    setSelectedRecords((prev) => {
      if (prev.some((item) => item.commitment === record.commitment)) {
        return prev.filter((item) => item.commitment !== record.commitment);
      } else {
        return [...prev, record];
      }
    });
  }, []);

  useEffect(() => {
    if (selectedRecords.length >= limit) {
      onConfirm(selectedRecords);
    }
  }, [selectedRecords]);

  return (
    <Content>
      <Flex bgColor={"green.50"} color={"green.600"} borderRadius={"lg"} p={2}>
        {t("JoinSplit:selectRecords", { COUNT: limit })}
      </Flex>
      <Flex fontWeight={"semibold"} mt={3}>
        <Text>{t("Send:commitment")}</Text>
        <Text ml={"auto"}>{t("Send:amount")}</Text>
      </Flex>
      <Flex direction={"column"} maxH={"400px"} overflowY={"auto"} pb={8}>
        {records.map((record, i) => (
          <Flex
            key={record.commitment}
            cursor={"pointer"}
            flex={1}
            mt="1"
            pt={"3"}
            pb={"2"}
            borderBottom="1px solid"
            borderColor={"gray.100"}
            justifyContent={"space-between"}
            onClick={() => {
              onSelectedRecords(record);
            }}
          >
            <Flex align={"center"}>
              {selectedRecords.some(
                (item) => item.commitment === record.commitment,
              ) ? (
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
    </Content>
  );
};
