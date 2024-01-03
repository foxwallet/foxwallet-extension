import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { DisplayAccount } from "@/scripts/background/store/vault/types/keyring";
import { Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface AccountInfoProps {
  account: DisplayAccount;
}

export const AccountInfo = (props: AccountInfoProps) => {
  const { account } = props;
  const { t } = useTranslation();

  return (
    <Flex
      alignSelf={"stretch"}
      justify={"space-between"}
      borderRadius={"lg"}
      borderStyle={"solid"}
      borderWidth={"1px"}
      borderColor={"gray.50"}
      flex={1}
      p={2}
    >
      <Text>{t("Dapp:account")}</Text>
      <Flex flexDir={"column"} align={"flex-end"} fontWeight={"bold"}>
        <MiddleEllipsisText text={account?.address} width={250} />
        <Text
          color={"gray.500"}
          fontSize={"13"}
        >{`(${account.accountName})`}</Text>
      </Flex>
    </Flex>
  );
};
