import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { H6 } from "../../../common/theme/components/text";
import { Button, Textarea } from "@chakra-ui/react";
import { Content } from "../../../layouts/Content";
import { validateMnemonic } from "bip39";
import { WarningArea } from "../../Custom/WarningArea";
import { useTranslation } from "react-i18next";
import { useCoinBasic } from "@/hooks/useCoinService";
import { DEFAULT_UNIQUE_ID_MAP } from "core/constants";
import { CoinType } from "core/types";
import { AleoImportPKType } from "core/coins/ALEO/types/AleoAccount";

type Props = {
  onConfirm: (privateKey: string) => void;
};

export const ImportPrivateKeyStep = ({ onConfirm }: Props) => {
  const { t } = useTranslation();
  const coinBasic = useCoinBasic(DEFAULT_UNIQUE_ID_MAP[CoinType.ALEO]);
  const [privateKey, setPrivateKey] = useState("");
  const privateKeyValid = useMemo(() => {
    return coinBasic.isValidPrivateKey(privateKey, AleoImportPKType.ALEO_PK);
  }, [privateKey]);

  const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value || "";
    value = value.trim();
    setPrivateKey(value);
  }, []);

  const isValid = useMemo(() => {
    return validateMnemonic(privateKey);
  }, [privateKey]);

  const showError = useMemo(() => {
    const words = privateKey.trim().split(" ");
    if (words.length === 12 || words.length === 24) {
      return !isValid;
    }
    return false;
  }, [privateKey, isValid]);

  return (
    <Content>
      <H6 mb="2">{t("PrivateKey:title")}</H6>
      <Textarea
        value={privateKey}
        onChange={onInputChange}
        placeholder={t("PrivateKey:enterPlaceholder")}
        size="md"
        resize={"none"}
        h={"150"}
        borderColor={showError ? "red.500" : undefined}
      />
      {!privateKeyValid && (
        <WarningArea container={{ mt: "2" }} content={"Wrong private key."} />
      )}
      <Button
        isDisabled={!isValid}
        position={"fixed"}
        bottom={10}
        left={"4"}
        right={"4"}
        onClick={() => onConfirm(privateKey.trim())}
      >
        {t("Common:confirm")}
      </Button>
    </Content>
  );
};
