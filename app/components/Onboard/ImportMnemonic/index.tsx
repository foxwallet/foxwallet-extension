import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from "react";
import { H6 } from "../../../common/theme/components/text";
import { Box, Button, Flex, Text, Textarea } from "@chakra-ui/react";
import { Content } from "../../../layouts/Content";
import { wordlists, validateMnemonic } from "bip39";
import { useDebounce } from "use-debounce";
import { useDataRef } from "../../../hooks/useDataRef";
import { WarningArea } from "../../Custom/WarningArea";
import { useTranslation } from "react-i18next";

type Props = {
  onConfirm: (mnemonic: string) => void;
};

export const ImportMnemonicStep = ({ onConfirm }: Props) => {
  const { t } = useTranslation();
  const [mnemonic, setMnemonic] = useState("");
  const mnemonicRef = useDataRef(mnemonic);
  const [debounceMnemonic] = useDebounce(mnemonic, 100, { trailing: true });
  const [matchWords, setMatchWords] = useState<string[]>([]);
  const matchWordsRef = useDataRef(matchWords);
  const [errorWord, setErrorWord] = useState("");

  const checkLastWord = useCallback((lastWord: string) => {
    if (!lastWord) {
      return { correct: true, matchWords: [] };
    }
    const wordlist = wordlists.english;
    let exist = false;
    const matches = [];
    for (let word of wordlist) {
      if (word === lastWord) {
        exist = true;
        break;
      }
      if (word.startsWith(lastWord)) {
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
      return { correct: true, matchWords: matches.slice(0, 10) };
    }
  }, []);

  const checkOtherWords = useCallback((words: string[]) => {
    const wordlist = wordlists.english;
    return words.findLast((it) => !wordlist.includes(it)) || "";
  }, []);

  const checkMnemonicWord = useCallback(
    (originalText: string) => {
      const words = originalText.trim().split(" ");
      const lastWord = words.pop() || "";
      const { correct: lastWordCorrect, matchWords: _matchWords } =
        checkLastWord(lastWord);
      setMatchWords(_matchWords);
      if (!lastWordCorrect) {
        setErrorWord(lastWord);
      } else {
        const otherError = checkOtherWords(words);
        setErrorWord(otherError);
      }
    },
    [checkLastWord, checkOtherWords],
  );

  useEffect(() => {
    if (debounceMnemonic) {
      checkMnemonicWord(debounceMnemonic);
    }
  }, [debounceMnemonic, checkMnemonicWord]);

  const onReplaceLastWord = useCallback(
    (word: string) => {
      const words = mnemonicRef.current.split(" ");
      words.pop();
      words.push(word);
      setMnemonic(words.join(" ") + " ");
    },
    [mnemonicRef],
  );

  const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    let processText = value.toLowerCase().replace(/\s\s+/g, " ");
    processText = processText.replace(/[^a-zA-Z\s]/g, "");
    setMnemonic(processText);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const word = matchWordsRef.current[0];
      if (word) {
        onReplaceLastWord(word);
      }
    }
  }, []);

  const isValid = useMemo(() => {
    return validateMnemonic(mnemonic.trim());
  }, [mnemonic]);

  const showError = useMemo(() => {
    const words = mnemonic.trim().split(" ");
    if (words.length === 12 || words.length === 24) {
      return !isValid;
    }
    return false;
  }, [mnemonic, isValid]);

  return (
    <Content>
      <H6 mb="2">{t("Mnemonic:title")}</H6>
      <Textarea
        autoComplete="off"
        value={mnemonic}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        placeholder={t("Mnemonic:enterPlaceholder")}
        size="md"
        resize={"none"}
        h={"150"}
        borderColor={showError ? "red.500" : undefined}
      />
      <Flex flexWrap={"wrap"}>
        {matchWords.map((item) => {
          return (
            <Box
              key={item}
              borderRadius={"md"}
              bg={"green.100"}
              px={"2"}
              py={"1"}
              mr={"2"}
              mt={"2"}
              onClick={() => onReplaceLastWord(item)}
            >
              <Text color={"green.700"}>{item}</Text>
            </Box>
          );
        })}
      </Flex>
      {!!errorWord && (
        <WarningArea
          container={{ mt: "2" }}
          content={t("Mnemonic:checkTips", { WORD: errorWord })}
        />
      )}
      <Button
        isDisabled={!isValid}
        position={"fixed"}
        bottom={10}
        left={"4"}
        right={"4"}
        onClick={() => {
          const data = mnemonic.trim();
          setMnemonic("");
          onConfirm(data);
        }}
      >
        {t("Common:confirm")}
      </Button>
    </Content>
  );
};
