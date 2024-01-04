import { Button, Flex } from "@chakra-ui/react";
import React, { useCallback, useMemo, useState } from "react";
import { Content } from "../../../layouts/Content";
import { BaseInputGroup } from "../../Custom/Input";
import { WarningArea } from "../../Custom/WarningArea";
import { useWallets } from "@/hooks/useWallets";
import { useTranslation } from "react-i18next";

export const WalletNameStep = (props: {
  onConfirm: (walletName: string) => void;
}) => {
  const { onConfirm: onSubmit } = props;
  const [walletName, setWalletName] = useState("");
  const { t } = useTranslation();
  const { t: commonT } = useTranslation("Common");
  const { walletList } = useWallets();

  const onWalletNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setWalletName(value);
    },
    [],
  );

  const dupWalletName = useMemo(() => {
    if (!walletList) {
      return false;
    }
    return walletList.some((item) => item.walletName === walletName);
  }, [walletList, walletName]);

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
        title={t("Wallet:Create:walletName")}
        container={{ mt: "2" }}
        required
        inputProps={{
          placeholder: t("Wallet:Create:walletNamePlaceholder"),
          value: walletName,
          onChange: onWalletNameChange,
          isInvalid: dupWalletName,
        }}
      />
      {dupWalletName && (
        <WarningArea
          container={{ mt: "2" }}
          content={t("Wallet:Create:dupWalletName")}
        />
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
