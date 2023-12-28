import { Button, Flex, InputRightElement } from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Content } from "../../../layouts/Content";
import { BaseInput, BaseInputGroup } from "../../Custom/Input";
import { WarningArea } from "../../Custom/WarningArea";
import {
  IconCheckLine,
  IconCloseLine,
  IconEyeOn,
  IconEyeClose,
} from "../../Custom/Icon";
import { type Score as PasswordScore } from "@zxcvbn-ts/core";
import { useDebounce } from "use-debounce";
import { PASSWORD_MINIMUL_LENGTH } from "../../../common/constants";
import { useClient } from "@/hooks/useClient";
import { useWallets } from "@/hooks/useWallets";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { useTranslation } from "react-i18next";

export const WalletNameStep = (props: {
  onConfirm: (walletName: string) => void;
}) => {
  const { onConfirm: onSubmit } = props;
  const [walletName, setWalletName] = useState("");
  const { t } = useTranslation("Onboard", {
    keyPrefix: "Onboard:CreateWallet",
  });
  const { t: commonT } = useTranslation("Common");
  const { flattenWalletList } = useWallets();

  const onWalletNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setWalletName(value);
    },
    [],
  );

  const dupWalletName = useMemo(() => {
    if (!flattenWalletList) {
      return false;
    }
    return flattenWalletList.some((item) => item.walletName === walletName);
  }, [flattenWalletList, walletName]);

  const disableConfirm = useMemo(() => {
    return !walletName || dupWalletName;
  }, [walletName]);

  const onConfirm = useCallback(async () => {
    if (disableConfirm) {
      return;
    }
    onSubmit(walletName);
  }, [disableConfirm, walletName, onSubmit]);

  return (
    <Content>
      <BaseInputGroup
        title={t("walletName")}
        container={{ mt: "2" }}
        required
        inputProps={{
          placeholder: t("walletNamePlaceholder"),
          value: walletName,
          onChange: onWalletNameChange,
          isInvalid: dupWalletName,
        }}
      />
      {dupWalletName && (
        <WarningArea container={{ mt: "2" }} content={t("dupWalletName")} />
      )}
      <Flex
        position={"fixed"}
        direction={"column"}
        left={0}
        right={0}
        bottom={"4"}
        px={4}
      >
        <Button isDisabled={disableConfirm} onClick={onConfirm}>
          {commonT("confirm")}
        </Button>
      </Flex>
    </Content>
  );
};
