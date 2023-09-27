import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { H6 } from "../../../common/theme/components/text";
import { Box, Button, Text, Textarea } from "@chakra-ui/react";
import { Content } from "../../../layouts/Content";
import { wordlists } from "bip39";
import { useDebounce } from "use-debounce";

type Props = {
  isValidMnemonic: (mnemonic: string) => void;
  onConfirm: (mnemonic: string) => void;
}

export const ImportMnemonicStep = ({ onConfirm, isValidMnemonic }: Props) => {
  const [mnemonic, setMnemonic] = useState("");
  const [debounceMnemonic] = useDebounce(mnemonic, 100, { trailing: true })
  const [matchWords, setMatchWords] = useState<string[]>([]);
  const [errorWord, setErrorWord] = useState("");

  const checkLastWord = useCallback((word: string) => {
    if (!word) {
      return { correct: true, matchWords: []};
    }
    const wordlist = wordlists.english;
    let exist = false;
    const matches = [];
    for (let word of wordlist) {
      if (word === word) {
        exist = true;
        break;
      }
      if (word.startsWith(word)) {
        matches.push(word);
      }
    }
    if (exist) {
      // last word is correct
      return { correct: true, matchWords: [] };
    } else if (matches.length === 0) {
      // last word is incorrect
      return { correct: false, matchWords: [] };
    } else {
      // last word is typing
      return { correct: true, matchWords: matches.slice(0, 6) };
    }
  }, []);

  const checkOtherWords = useCallback((words: string[]) => {
    const wordlist = wordlists.english;
    return words.findLast((it) => !wordlist.includes(it)) || "";
  }, []);

  const checkMnemonicWord = useCallback((originalText: string) => {
    const words = originalText.split(" ");
    const lastWord = words.pop() || "";
    const { correct: lastWordCorrect, matchWords: _matchWords } = checkLastWord(lastWord);
    setMatchWords(_matchWords);
    if (!lastWordCorrect) {
      setErrorWord(lastWord);
    } else {
      const otherError = checkOtherWords(words);
      setErrorWord(otherError);
    }
  }, [checkLastWord, checkOtherWords]);

  useEffect(() => {
    if (debounceMnemonic) {
      checkMnemonicWord(debounceMnemonic);
    }
  }, [debounceMnemonic, checkMnemonicWord]);

  const onInputChange = (e: SyntheticEvent) => {
    let value = e.target.value;
    const processText = value.toLowerCase().replace(/\s\s+/g, " ");
    setMnemonic(processText);
  }

  return (
    <Content>
      <H6 mb="2" color={"gray.600"} >{"Seed phrase"}</H6>
      <Textarea
        value={mnemonic}
        onChange={onInputChange}
        placeholder="Enter the seed phrase, separated by spaces"
        size='md'
        resize={"none"}
        h={"100"}
      />
      {
        matchWords.map((item) => {
          return (
            <Box>
            <Text>{item}</Text>
            </Box>
          );
        })
      }
      <Button position={"fixed"} bottom={10} left={"4"} right={"4"} onClick={() => onConfirm(mnemonic)}>{"Confirm"}</Button>
    </Content>
  )
};