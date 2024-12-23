import { H1 } from "@/common/theme/components/text";
import {
  IconCheckLine,
  IconCloseLine,
  IconEyeClose,
  IconEyeOn,
} from "@/components/Custom/Icon";
import { BaseInputGroup } from "@/components/Custom/Input";
import { useAuth } from "@/hooks/useAuth";
import {
  Box,
  Button,
  Flex,
  Image,
  InputRightElement,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import WALLET_LOGO from "@/common/assets/image/logo.png";
import { IconFoxWallet } from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { useWrongPasswordToast } from "@/components/Custom/WrongPasswordToast";

// TODO: add reset
// TODO: add biometric auth
function Lock() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [viewPass, setViewPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useWrongPasswordToast();

  const onPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsPasswordValid(true);
      setPassword(event.target.value);
    },
    [],
  );

  const onConfirm = useCallback(async () => {
    if (!password) {
      return;
    }
    try {
      const res = await login(password);
      if (!res) {
        showToast();
      }
      setIsPasswordValid(res);
    } catch (err) {
      console.log("===> Lock login: ", err);
      setIsPasswordValid(false);
    }
  }, [password, login, navigate]);

  const passwordInvalid = !!password && !isPasswordValid;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
    },
    [onConfirm],
  );

  const onCleanInput = useCallback(() => {
    setPassword("");
  }, []);

  return (
    <Flex
      direction={"column"}
      w={"full"}
      h={"full"}
      justifyContent={"flex-start"}
      pt={100}
    >
      <Flex justify={"center"} align={"center"} flexDir={"column"}>
        <Image src={WALLET_LOGO} w={20} h={20} />
        <IconFoxWallet w={138} h={20} />
      </Flex>
      <BaseInputGroup
        container={{ mt: 10, mx: 6, mb: 4 }}
        title={t("Password:title")}
        inputProps={{
          isInvalid: passwordInvalid,
          placeholder: t("Password:enter"),
          type: viewPass ? "text" : "password",
          value: password,
          onChange: onPasswordChange,
          onKeyDown: handleKeyDown,
        }}
        rightElement={
          <InputRightElement
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            h="full"
            mr={"2"}
          >
            {!!password && (
              <Box onClick={onCleanInput} cursor={"pointer"}>
                <IconCloseLine w={"5"} h="full" mr={2} />
              </Box>
            )}
            <Box
              onClick={() => {
                setViewPass((curr) => !curr);
              }}
              cursor={"pointer"}
            >
              {!viewPass ? (
                <IconEyeClose w={"5"} h="full" />
              ) : (
                <IconEyeOn w={"5"} h="full" />
              )}
            </Box>
          </InputRightElement>
        }
      />
      <Button isDisabled={!password} onClick={onConfirm} mx="6" mt="20">
        {t("Common:confirm")}
      </Button>
    </Flex>
  );
}

export default Lock;
