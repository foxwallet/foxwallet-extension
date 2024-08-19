import { useDispatch } from "react-redux";
import { Dispatch } from "../../../store/store";
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
import { shuffle } from "../../../common/utils/array";
import { useDataRef } from "../../../hooks/useDataRef";
import { IconCloseLineGray } from "../../Custom/Icon";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { onConfirm, mnemonic } = props;
  const wordList = useMemo(() => {
    return mnemonic.split(" ");
  }, [mnemonic]);
  const targetWordList = useRef(wordList);
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

  const [finishSelected, isValid] = useMemo(() => {
    let havePlaceholder = answerWordList.some((item) => item === PLACEHOLDER);
    if (havePlaceholder) {
      return [false, false];
    }
    for (let i = 0; i < answerWordList.length; i++) {
      if (answerWordList[i] !== targetWordList.current[i]) {
        return [true, false];
      }
    }
    return [true, true];
  }, [answerWordList, targetWordList]);

  const containerBorderColor = useMemo(() => {
    if (!finishSelected) {
      return "black";
    }
    return isValid ? "green.600" : "red.300";
  }, [finishSelected, isValid]);

  return (
    <Content>
      <Flex
        p={2}
        borderRadius={"lg"}
        flexWrap={"wrap"}
        minH={12}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
        borderColor={containerBorderColor}
        borderWidth={"1.5px"}
      >
        {answerWordList.map((word, index) => {
          const option = placeholderIndexList.includes(index);

          if (word === PLACEHOLDER) {
            return (
              <Box
                display={"flex"}
                key={index}
                px={2}
                py={2}
                borderRadius="lg"
                borderStyle={"solid"}
                borderWidth={"2px"}
                borderColor={"gray.100"}
                justifyContent={"center"}
                alignItems={"center"}
                width={"32%"}
                mr={(index + 1) % 3 === 0 ? "0" : "2%"}
                mt={index >= 3 ? 2 : 0}
              >
                <Text
                  wordBreak={"break-word"}
                  fontWeight={"bold"}
                  unselectable={"on"}
                  color={"gray.300"}
                  fontSize={"smaller"}
                  lineHeight={"5"}
                >
                  {index + 1}.
                </Text>
              </Box>
            );
          }

          return (
            <Box
              display={"flex"}
              key={index}
              px={2}
              py={2}
              borderRadius="lg"
              borderStyle={"solid"}
              borderWidth={"1.5px"}
              borderColor={"gray.100"}
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
                color={"gray.300"}
                fontSize={"smaller"}
                lineHeight={"5"}
              >
                {index + 1}.&nbsp;
              </Text>
              <Text
                wordBreak={"break-word"}
                fontWeight={"bold"}
                unselectable={"on"}
                data-child={index}
                lineHeight={"5"}
              >
                {word}
              </Text>
              {option && <IconCloseLineGray w={3} h={3} />}
            </Box>
          );
        })}
      </Flex>
      <Grid
        mt={4}
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
            borderColor={"gray.100"}
            borderWidth={"2px"}
            justifyContent={"center"}
            alignItems={"center"}
            flexWrap={"wrap"}
            data-child={index}
            onClick={() => onWordSelect(otherWord)}
          >
            <Text
              wordBreak={"break-word"}
              fontWeight={"bold"}
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
          {t("Common:confirm")}
        </Button>
      </Flex>
    </Content>
  );
};
