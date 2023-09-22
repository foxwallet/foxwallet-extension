import { useDispatch } from "react-redux";
import { Dispatch } from "../../store/store";
import { useWalletDispatch } from "../../hooks/useStore";
import { clients, useClient } from "../../hooks/useClient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Text, GridItem, BoxProps, Button } from "@chakra-ui/react";
import { PrivateKey } from "@aleohq/wasm"
import { logger } from "../../common/utils/logger";
import { nanoid } from "nanoid";
import { DisplayWallet } from "../../scripts/background/store/vault/types/keyring";
import { Content } from "../../layouts/Content";

function Dot(props: BoxProps) {
  return <Box w={2} h={2} borderRadius={4} bg={"gray.100"} {...props}/>
}

function WordGrid({ words }: { words: string[] }) {
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={2} alignSelf={"stretch"} bg={"gray.50"} p={2} borderRadius={"lg"}>
      {words.map((word, index) => (
        <GridItem display={"flex"} key={index} px={2} py={2} borderRadius="lg" bg={"gray.100"} justifyContent={"center"} alignItems={"center"} flexWrap={"wrap"}>
          <Text wordBreak={"break-word"} fontWeight={"bold"}>{index + 1}.{word}</Text>
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

export const ConfirmMnemonicStep = (props: { onConfirm: () => void, walletName: string }) => {
  const { onConfirm, walletName } = props;
  const { popupServerClient } = useClient();
  const [mnemonic, setMnemonic] = useState("");
  const workList = useMemo(() => {
    return mnemonic.split(" ");
  }, [mnemonic]);
  const walletIdRef = useRef("");
  const walletRef = useRef<DisplayWallet | null>(null);

  useEffect(() => {
    if (walletIdRef.current) {
      return;
    }
    walletIdRef.current = nanoid();
    const walletId = walletIdRef.current;
    popupServerClient
      .createWallet({ walletName, walletId, revealMnemonic: true })
      .then((wallet) => {
        walletRef.current = wallet;
        setMnemonic(wallet.mnemonic || "");
      })
  }, []);

  const regenerate = useCallback(() => {
    const walletId = walletIdRef.current;
    popupServerClient
      .regenerateWallet({ walletName, walletId, revealMnemonic: true })
      .then((wallet) => {
        walletRef.current = wallet;
        setMnemonic(wallet.mnemonic || "");
      })
  }, []);


  return <Content>
    <WordGrid words={workList}/>
    <Flex flexDirection={"column"} bg={"gray.50"} mt={4} borderRadius={"lg"} p={2} pt={1}>
      {
        tips.map((tip, index) => (
          <Flex mt={1} key={index}>
            <Dot mt={1} />
            <Text ml={2} fontSize={"smaller"} color={"gray.500"} maxW={"95%"}>{tip}</Text>
          </Flex>
        ))
      }
    </Flex>
    <Flex mt={8}>
      <Button colorScheme="secondary" flex={1} mr={4} disabled={!mnemonic} onClick={regenerate}>{"Regenerate"}</Button>
      <Button flex={1} onClick={onConfirm}>{"Confirm"}</Button>
    </Flex>
  </Content>
};
