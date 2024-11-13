import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { H6 } from "../../../common/theme/components/text";
import { Button, Textarea } from "@chakra-ui/react";
import { Content } from "../../../layouts/Content";
import { validateMnemonic } from "bip39";
import { WarningArea } from "../../Custom/WarningArea";
import { useTranslation } from "react-i18next";
import { useCoinBasic } from "@/hooks/useCoinService";
import { DEFAULT_CHAIN_UNIQUE_ID } from "core/constants/chain";
import { CoinType } from "core/types";
import { AleoImportPKType } from "core/coins/ALEO/types/AleoAccount";

type Props = {
  onConfirm: (privateKey: string) => void;
};

export const ImportPrivateKeyStep = ({ onConfirm }: Props) => {
  const { t } = useTranslation();
  const coinBasic = useCoinBasic(DEFAULT_CHAIN_UNIQUE_ID[CoinType.ALEO]);
  const [privateKey, setPrivateKey] = useState("");
  const privateKeyValid = useMemo(() => {
    return coinBasic.isValidPrivateKey(privateKey, AleoImportPKType.ALEO_PK);
  }, [privateKey]);

  const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value || "";
    value = value.trim();
    setPrivateKey(value);
  }, []);

  const showError = useMemo(() => {
    if (!privateKey) {
      return false;
    }
    return !privateKeyValid;
  }, [privateKey, privateKeyValid]);

  return (
    <Content>
      <H6 mb="2">{t("PrivateKey:title")}</H6>
      <Textarea
        autoComplete="off"
        value={privateKey}
        onChange={onInputChange}
        placeholder={t("PrivateKey:enterPlaceholder")}
        size="md"
        resize={"none"}
        h={"150"}
        borderColor={showError ? "red.500" : undefined}
      />
      {showError && (
        <WarningArea container={{ mt: "2" }} content={"Wrong private key."} />
      )}
      <Button
        isDisabled={!privateKeyValid}
        position={"fixed"}
        bottom={10}
        left={"4"}
        right={"4"}
        onClick={() => {
          const data = privateKey.trim();
          setPrivateKey("");
          onConfirm(data);
        }}
      >
        {t("Common:confirm")}
      </Button>
    </Content>
  );
};
