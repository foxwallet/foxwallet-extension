import { useDispatch } from "react-redux";
import { Dispatch } from "../../../store/store";
import { clients, useClient } from "../../../hooks/useClient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  GridItem,
  BoxProps,
  Button,
  Link,
} from "@chakra-ui/react";
import { logger } from "../../../common/utils/logger";
import { nanoid } from "nanoid";
import { DisplayWallet } from "../../../scripts/background/store/vault/types/keyring";
import { Content } from "../../../layouts/Content";
import { IconPreventScreenshot } from "../../Custom/Icon";

function Dot(props: BoxProps) {
  return <Box w={1.5} h={1.5} borderRadius={3} bg={"gray.500"} {...props} />;
}

function WordGrid({ words }: { words: string[] }) {
  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      gap={2}
      alignSelf={"stretch"}
      p={2}
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

const tips = [
  "Please note down the seed phrase in order.",
  "Please copy and keep it in a safe place.",
  "Seed phrase or private key are the only way to recover your wallet. Once lost, it cannot be retrieved. Do not save them via screenshots or social medias.",
];

export const BackupMnemonicStep = (props: {
  mnemonic?: string;
  onConfirm: () => void;
  createWallet: () => Promise<void>;
  regenerateWallet: () => Promise<void>;
}) => {
  const { mnemonic, onConfirm, createWallet, regenerateWallet } = props;
  const [startBackup, setStartBackup] = useState(false);
  const wordList = useMemo(() => {
    if (!mnemonic) {
      return [];
    }
    return mnemonic.split(" ");
  }, [mnemonic]);

  useEffect(() => {
    createWallet();
  }, [createWallet]);

  if (!mnemonic) {
    return null;
  }

  return (
    <Content>
      <Flex position={"relative"}>
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
            onClick={() => setStartBackup(true)}
          >
            <IconPreventScreenshot w={"8"} h={"8"} mb={2} />
            <Text mb={2} fontWeight={"bold"}>
              {"Click here to display mnemonic phase"}
            </Text>
            <Text fontWeight={"bold"}>
              {"Please confirm that the surroundings are safe"}
            </Text>
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
        borderColor={"gray.50"}
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
      <Flex justifyContent={"center"} mt={"5"}>
        <Link
          textDecorationLine={"underline"}
          textDecorationColor={"green.600"}
          color={"green.600"}
          fontWeight={"bold"}
        >
          Remind me later
        </Link>
      </Flex>
      <Flex mt={12}>
        <Button
          colorScheme="secondary"
          flex={1}
          mr={4}
          isDisabled={!mnemonic}
          onClick={regenerateWallet}
        >
          {"Regenerate"}
        </Button>
        <Button flex={1} isDisabled={!startBackup} onClick={() => onConfirm()}>
          {"Confirm"}
        </Button>
      </Flex>
    </Content>
  );
};
