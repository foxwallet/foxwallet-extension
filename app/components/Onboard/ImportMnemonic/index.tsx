import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { H6 } from "@/common/theme/components/text";
import { Box, Button, Flex, Text, Textarea } from "@chakra-ui/react";
import { Content } from "@/layouts/Content";
import { wordlists, validateMnemonic } from "bip39";
import { useDebounce } from "use-debounce";
import { useDataRef } from "@/hooks/useDataRef";
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
  const wordSet = useMemo(() => new Set(wordlists.english), []);

  const checkLastWord = useCallback(
    (lastWord: string) => {
      if (!lastWord) {
        return { correct: true, matchWords: [] };
      }

      const lowercaseWord = lastWord.toLowerCase();
      if (wordSet.has(lowercaseWord)) {
        return { correct: true, matchWords: [] };
      }

      // 对于前缀匹配，遍历
      const matches = Array.from(wordSet)
        .filter((word) => word.startsWith(lowercaseWord))
        .slice(0, 10);

      return {
        correct: matches.length > 0,
        matchWords: matches,
      };
    },
    [wordSet],
  );

  const checkOtherWords = useCallback(
    (words: string[]) => {
      return (
        [...words].reverse().find((word) => !wordSet.has(word.toLowerCase())) ??
        ""
      );
    },
    [wordSet],
  );

  const checkMnemonicWord = useCallback(
    (originalText: string) => {
      const words = originalText.trim().split(" ");
      const lastWord = words.pop() ?? "";
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
    const value = e.target.value;
    let processText = value.toLowerCase().replace(/\s\s+/g, " ");
    processText = processText.replace(/[^a-zA-Z\s]/g, "");
    setMnemonic(processText);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const word = matchWordsRef.current[0];
        if (word) {
          onReplaceLastWord(word);
        }
      }
    },
    [matchWordsRef, onReplaceLastWord],
  );

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
              onClick={() => {
                onReplaceLastWord(item);
              }}
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
