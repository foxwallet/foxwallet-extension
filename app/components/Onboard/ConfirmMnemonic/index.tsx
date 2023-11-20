import { useDispatch } from "react-redux";
import { Dispatch } from "../../../store/store";
import { useWalletDispatch } from "../../../hooks/useStore";
import { clients, useClient } from "../../../hooks/useClient";
import {
  MouseEventHandler,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  GridItem,
  BoxProps,
  Button,
} from "@chakra-ui/react";
import { logger } from "../../../common/utils/logger";
import { nanoid } from "nanoid";
import { DisplayWallet } from "../../../scripts/background/store/vault/types/keyring";
import { Content } from "../../../layouts/Content";
import { showMnemonicWarningDialog } from "../MnemonicWarningDialog";
import { shuffle } from "../../../common/utils/array";
import { useDataRef } from "../../../hooks/useDataRef";
import { IconCloseCircle } from "../../Custom/Icon";

function WordGrid({ words }: { words: string[] }) {
  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      gap={2}
      alignSelf={"stretch"}
      bg={"gray.50"}
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
          bg={"gray.100"}
          justifyContent={"center"}
          alignItems={"center"}
          flexWrap={"wrap"}
        >
          <Text wordBreak={"break-word"} fontWeight={"bold"}>
            {index + 1}.{word}
          </Text>
        </GridItem>
      ))}
    </Grid>
  );
}

const PLACEHOLDER = "__PLACEHOLDER__";

export const ConfirmMnemonicStep = (props: {
  onConfirm: () => void;
  mnemonic: string;
}) => {
  const { onConfirm, mnemonic } = props;
  const wordList = useMemo(() => {
    return mnemonic.split(" ");
  }, [mnemonic]);
  const targetWordList = useRef(wordList);
  // const shuffleWordList = useMemo(() => {
  //   return shuffle(wordList.slice(1));
  // }, [wordList]);
  const [partialWordList, initialOtherWords, placeholderIndexList] =
    useMemo(() => {
      const otherWords: string[] = [];
      const indexList: number[] = [];
      const res = wordList.map((item, index) => {
        if (index % 2 === 0 || index % 5 === 0) {
          return item;
        }
        otherWords.push(item);
        indexList.push(index);
        return PLACEHOLDER;
      });
      return [res, otherWords, indexList];
    }, [wordList]);
  const shuffleInitialOtherWords = useMemo(() => {
    return shuffle(initialOtherWords);
  }, [initialOtherWords]);
  const [answerWordList, setAnswerWordList] = useState(partialWordList);
  const answerWordListRef = useDataRef(answerWordList);

  const [otherWordList, setOtherWordList] = useState(shuffleInitialOtherWords);
  const otherWordListRef = useDataRef(otherWordList);

  const onWordCancel = useCallback(
    (i: number) => {
      const word = answerWordListRef.current[i];
      setOtherWordList((prev) => [...prev, word]);
      setAnswerWordList((prev) => {
        const newList = [...prev];
        newList[i] = PLACEHOLDER;
        return [...newList];
      });
    },
    [otherWordListRef, answerWordListRef],
  );

  const onWordSelect = useCallback(
    (word: string) => {
      setAnswerWordList((prev) => {
        const newList = [...prev];
        for (let i = 0; i < placeholderIndexList.length; i++) {
          const index = placeholderIndexList[i];
          if (newList[index] === PLACEHOLDER) {
            newList[index] = word;
            break;
          }
        }
        return newList;
      });
      setOtherWordList((prev) => prev.filter((item) => item !== word));
    },
    [otherWordListRef, answerWordListRef],
  );

  const isValid = useMemo(() => {
    for (let i = 0; i < answerWordList.length; i++) {
      if (answerWordList[i] !== targetWordList.current[i]) {
        return false;
      }
    }
    return true;
  }, [answerWordList, targetWordList]);

  return (
    <Content>
      <Flex
        bg={"gray.50"}
        p={2}
        borderRadius={"lg"}
        flexWrap={"wrap"}
        minH={12}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
        borderColor={isValid ? "green.300" : "red.300"}
        borderWidth={"1px"}
      >
        {answerWordList.map((word, index) => {
          const option = placeholderIndexList.includes(index);

          if (word === PLACEHOLDER) {
            return (
              <Box
                key={index}
                width={"32%"}
                mr={(index + 1) % 3 === 0 ? "0" : "2%"}
                mt={index >= 3 ? 2 : 0}
              />
            );
          }

          return (
            <Box
              display={"flex"}
              key={index}
              px={2}
              py={2}
              borderRadius="lg"
              bg={"gray.100"}
              justifyContent={"center"}
              alignItems={"center"}
              width={"32%"}
              mr={(index + 1) % 3 === 0 ? "0" : "2%"}
              mt={index >= 3 ? 2 : 0}
              onClick={option ? () => onWordCancel(index) : undefined}
            >
              <Text
                wordBreak={"break-word"}
                fontWeight={"bold"}
                unselectable={"on"}
                data-child={index}
              >
                {word}
              </Text>
              {option && <IconCloseCircle w={4} h={4} />}
            </Box>
          );
        })}
      </Flex>
      <Grid
        templateColumns="repeat(3, 1fr)"
        gap={2}
        alignSelf={"stretch"}
        p={2}
        borderRadius={"lg"}
      >
        {otherWordList.map((otherWord, index) => (
          <GridItem
            display={"flex"}
            key={index}
            px={2}
            py={2}
            borderRadius="lg"
            bg={"orange.100"}
            justifyContent={"center"}
            alignItems={"center"}
            flexWrap={"wrap"}
            data-child={index}
            onClick={() => onWordSelect(otherWord)}
          >
            <Text
              wordBreak={"break-word"}
              fontWeight={"bold"}
              color={"orange.500"}
              unselectable={"on"}
              data-child={index}
            >
              {otherWord}
            </Text>
          </GridItem>
        ))}
      </Grid>
      <Flex position={"fixed"} bottom={10} left={4} right={4}>
        <Button flex={1} onClick={onConfirm} isDisabled={!isValid}>
          {"Confirm"}
        </Button>
      </Flex>
    </Content>
  );
};
