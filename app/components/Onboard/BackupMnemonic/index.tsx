import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  GridItem,
  type BoxProps,
  Button,
  Link,
} from "@chakra-ui/react";
import { Content } from "../../../layouts/Content";
import { IconPreventScreenshot } from "../../Custom/Icon";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useThemeStyle } from "@/hooks/useThemeStyle";

function Dot(props: BoxProps) {
  return <Box w={1.5} h={1.5} borderRadius={3} bg={"gray.500"} {...props} />;
}

function WordGrid({ words }: { words: string[] }) {
  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      gap={2}
      alignSelf={"stretch"}
      borderRadius={"lg"}
    >
      {words.map((word, index) => (
        <GridItem
          display={"flex"}
          key={index}
          px={2}
          py={2}
          borderRadius="lg"
          borderWidth={"1px"}
          borderStyle={"solid"}
          borderColor={"gray.100"}
          justifyContent={"center"}
          alignItems={"center"}
          flexWrap={"wrap"}
        >
          <Flex wordBreak={"break-word"} alignItems={"center"}>
            <Text color={"gray.400"}>{index + 1}.&nbsp;</Text>
            {word}
          </Flex>
        </GridItem>
      ))}
    </Grid>
  );
}

export const BackupMnemonicStep = (props: {
  mnemonic?: string;
  onConfirm: () => void;
  createWallet?: () => Promise<void>;
  // regenerateWallet?: () => Promise<void>;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mnemonic, onConfirm, createWallet } = props;
  const [startBackup, setStartBackup] = useState(false);
  const tips = useMemo(() => {
    return [
      t("Mnemonic:warning1"),
      t("Mnemonic:warning2"),
      t("Mnemonic:warning3"),
    ];
  }, []);

  const wordList = useMemo(() => {
    if (!mnemonic) {
      return [];
    }
    return mnemonic.split(" ");
  }, [mnemonic]);

  useEffect(() => {
    void createWallet?.();
  }, [createWallet]);

  const { borderColor } = useThemeStyle();

  if (!mnemonic) {
    return null;
  }

  return (
    <Content>
      <Flex position={"relative"} justify={"center"} flexDir={"column"}>
        {!startBackup && (
          <Flex
            position={"absolute"}
            left={0}
            right={0}
            top={0}
            bottom={0}
            flexDir={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            backdropFilter="blur(10px)"
            onClick={() => {
              setStartBackup(true);
            }}
          >
            <IconPreventScreenshot w={"8"} h={"8"} mb={2} />
            <Text mb={2} fontWeight={"bold"}>
              {t("Mnemonic:backupTips1")}
            </Text>
            <Text fontWeight={"bold"}>{t("Mnemonic:backupTips2")}</Text>
          </Flex>
        )}
        <WordGrid words={wordList} />
      </Flex>
      <Flex
        flexDirection={"column"}
        mt={4}
        borderRadius={"lg"}
        borderStyle={"solid"}
        borderWidth={"2px"}
        borderColor={borderColor}
        p={2}
      >
        {tips.map((tip, index) => (
          <Flex mt={1} key={index}>
            <Dot mt={1.5} />
            <Text ml={2} fontSize={"small"} color={"gray.600"} maxW={"95%"}>
              {tip}
            </Text>
          </Flex>
        ))}
      </Flex>
      <Flex mt={10}>
        {/* {!!regenerateWallet && (
          <Button
            colorScheme="secondary"
            flex={1}
            mr={4}
            isDisabled={!mnemonic}
            onClick={regenerateWallet}
          >
            {t("Mnemonic:regenerate")}
          </Button>
        )} */}
        <Button
          flex={1}
          isDisabled={!startBackup}
          onClick={() => {
            onConfirm();
          }}
        >
          {t("Common:confirm")}
        </Button>
      </Flex>
      <Flex
        justifyContent={"center"}
        position={"fixed"}
        bottom={7}
        left={0}
        right={0}
      >
        <Link
          textDecorationLine={"underline"}
          textDecorationColor={"green.600"}
          color={"green.600"}
          fontWeight={"bold"}
          onClick={() => {
            navigate("/main");
          }}
        >
          <Text fontSize={"smaller"}>{t("Mnemonic:later")}</Text>
        </Link>
      </Flex>
    </Content>
  );
};
