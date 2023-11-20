import {
  Box,
  Modal,
  ModalBody,
  type ModalBodyProps,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  type ModalFooterProps,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  TextProps,
  ModalProps,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { H6 } from "../../../common/theme/components/text";
import { IconCloseLine } from "../Icon";
import { popupEvents } from "../../../common/utils/event";

interface MessageToastProps {
  message: string;
  messageStyle?: TextProps;
  messageNode?: React.ReactNode;
  duration?: number;
}

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessageToast(props: MessageToastProps & ToastProps) {
  const { isOpen, onClose, message, messageStyle, messageNode } = props;

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        alignSelf={"center"}
        bg={"white"}
        p={"4"}
        borderRadius={"md"}
      >
        <ModalBody
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          {messageNode || <Text {...messageStyle}>{message}</Text>}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function MessageToastWrapper(
  props: MessageToastProps & { duration?: number; onDismiss: () => void },
) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const duration = props.duration || 2000;

  useEffect(() => {
    onOpen();
    let timer = setTimeout(() => {
      onClose();
      props.onDismiss();
    }, duration);
    return () => {
      clearTimeout(timer);
      props.onDismiss();
    };
  }, [onOpen, duration, onClose]);

  return <MessageToast {...props} isOpen={isOpen} onClose={onClose} />;
}

export function promisifyMessageToastWrapper() {
  return async (props: MessageToastProps) => {
    const id = Date.now();

    return await new Promise<void>((resolve, reject) => {
      const onDismiss = async () => {
        resolve();
      };
      popupEvents.emit(
        "showDialog",
        <MessageToastWrapper key={id} onDismiss={onDismiss} {...props} />,
      );
    });
  };
}

export const showMessageToast = promisifyMessageToastWrapper();
