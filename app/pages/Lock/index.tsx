import {
  IconCloseLine,
  IconEyeClose,
  IconEyeOn,
  IconFoxWallet,
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
} from "@chakra-ui/react";
import { useCallback, useState, type KeyboardEvent } from "react";
import WALLET_LOGO from "@/common/assets/image/logo.png";
import { useTranslation } from "react-i18next";
import { useWrongPasswordToast } from "@/components/Custom/WrongPasswordToast";
import { showResetApplicationDialog } from "@/components/Wallet/ResetApplicationDialog";
import { useWallets } from "@/hooks/useWallets";
import { useNavigate } from "react-router-dom";

// TODO: add biometric auth
function Lock() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [viewPass, setViewPass] = useState(false);
  const { login } = useAuth();
  const { showToast } = useWrongPasswordToast();
  const [errTimes, setErrTimes] = useState(0);
  const navigate = useNavigate();
  const { resetWallet } = useWallets();

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
        setErrTimes((pre) => pre + 1);
      }
      setIsPasswordValid(res);
    } catch (err) {
      console.log("===> Lock login: ", err);
      setIsPasswordValid(false);
      setErrTimes((pre) => pre + 1);
    }
  }, [password, login, showToast]);

  const passwordInvalid = !!password && !isPasswordValid;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void onConfirm();
      }
    },
    [onConfirm],
  );

  const onCleanInput = useCallback(() => {
    setPassword("");
  }, []);

  const onReset = useCallback(async () => {
    try {
      const { confirmed } = await showResetApplicationDialog();
      if (confirmed) {
        const res = await resetWallet();
        if (res) {
          navigate("/onboard/home");
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [navigate, resetWallet]);

  return (
    <Flex
      direction={"column"}
      w={"full"}
      h={"full"}
      justifyContent={"flex-start"}
      mt={100}
    >
      <Flex justify={"center"} align={"center"} flexDir={"column"}>
        <Image src={WALLET_LOGO} w={20} h={20} />
        <IconFoxWallet w={138} h={20} />
      </Flex>
      <BaseInputGroup
        container={{ mt: 5, mx: 6, mb: 4 }}
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
      <Button isDisabled={!password} onClick={onConfirm} mx="6" mt="10">
        {t("Common:confirm")}
      </Button>
      {errTimes >= 3 && (
        <Flex direction={"column"} mx={6} mt={6} textAlign={"center"}>
          <Text fontSize={10} color={"#777e90"}>
            {t("Reset:explain")}
          </Text>
          <Flex
            w={"full"}
            h={10}
            alignItems={"center"}
            justifyContent={"center"}
            // mt={2}
          >
            <Text
              onClick={onReset}
              cursor={"pointer"}
              // textDecoration={"underline"}
              textColor={"#EF466F"}
              fontSize={12}
            >
              {t("Setting:resetApplication")}
            </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

export default Lock;
