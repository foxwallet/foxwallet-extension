import {
  Box,
  Modal,
  ModalBody,
  ModalBodyProps,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalFooterProps,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { H6 } from "../../common/theme/components/text";
import { IconCloseLine } from "../Icon";

type ModalProps = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  body: React.ReactNode;
  footer: React.ReactNode;
  bodyStyle?: ModalBodyProps;
  footerStyle?: ModalFooterProps;
};

export function BasicModal(props: ModalProps) {
  const { title, isOpen, onClose, body, footer, bodyStyle, footerStyle } =
    props;

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent
        alignSelf={"center"}
        bg={"white"}
        p={"4"}
        borderRadius={"md"}
      >
        <ModalHeader
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          mb={4}
        >
          <Box w={5} h={5} />
          <H6>{title}</H6>
          <IconCloseLine
            w={5}
            h={5}
            cursor={"pointer"}
            fill={"black"}
            onClick={onClose}
          />
        </ModalHeader>

        <ModalBody {...bodyStyle}>{body}</ModalBody>
        <ModalFooter justifyContent={"center"} mt={4} {...footerStyle}>
          {footer}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
