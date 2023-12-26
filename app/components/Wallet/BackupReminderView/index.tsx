import {
  IconArrowBackup,
  IconBackupReminder,
  IconCloseLineGray,
} from "@/components/Custom/Icon";
import { usePopupSelector } from "@/hooks/useStore";
import { Box, Flex, Text } from "@chakra-ui/react";
import { isEqual } from "lodash";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export const BackupReminderView = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  const backupedMnemonic = usePopupSelector((state) => {
    const currAccount = state.account.selectedAccount;
    const backupedMnemonic =
      state.account.walletBackupMnemonicMap[currAccount.walletId] ?? false;
    return backupedMnemonic;
  }, isEqual);

  const onBackup = useCallback(() => {
    navigate("/backup_mnemonic");
  }, [navigate]);

  if (backupedMnemonic || !visible) return null;

  return (
    <Flex
      px={5}
      py={3}
      justify={"space-between"}
      borderBottomWidth={1}
      borderColor={"#E6E8EC"}
    >
      <Flex direction={"column"} justify={"center"}>
        <Text color={"#000"} fontWeight={500} fontSize={13} maxW={150}>
          You haven't backed up your wallet yet
        </Text>
        <Flex as="button" align={"center"} mt={1} onClick={onBackup}>
          <Text color={"#00D856"} fontWeight={500} fontSize={13}>
            Backup now
          </Text>
          <IconArrowBackup ml={1} />
        </Flex>
      </Flex>
      <Flex align={"flex-start"}>
        <IconBackupReminder mt={1} />
        <Box as="button" onClick={() => setVisible((prev) => !prev)}>
          <IconCloseLineGray w={4} h={4} />
        </Box>
      </Flex>
    </Flex>
  );
};
