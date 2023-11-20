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
} from "@chakra-ui/react";
import { useState } from "react";
import { H6 } from "../../../common/theme/components/text";
import { IconCloseLine } from "../Icon";

interface ModalProps {
  title?: string;
  isOpen: boolean;
  hideClose?: boolean;
  onClose: () => void;
  body: React.ReactNode;
  footer: React.ReactNode;
  bodyStyle?: ModalBodyProps;
  footerStyle?: ModalFooterProps;
}

export function BasicModal(props: ModalProps) {
  const {
    title,
    isOpen,
    hideClose,
    onClose,
    body,
    footer,
    bodyStyle,
    footerStyle,
  } = props;

  return (
    <Modal
      closeOnEsc={!hideClose}
      closeOnOverlayClick={!hideClose}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        alignSelf={"center"}
        bg={"white"}
        p={"4"}
        borderRadius={"md"}
      >
        {(!!title || !hideClose) && (
          <ModalHeader
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            mb={4}
          >
            <Box w={5} h={5} />
            {!!title && <H6>{title}</H6>}
            {hideClose ? (
              <Box w={5} h={5} />
            ) : (
              <IconCloseLine
                w={5}
                h={5}
                cursor={"pointer"}
                fill={"black"}
                onClick={onClose}
              />
            )}
          </ModalHeader>
        )}

        <ModalBody {...bodyStyle}>{body}</ModalBody>
        <ModalFooter justifyContent={"center"} mt={4} {...footerStyle}>
          {footer}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
