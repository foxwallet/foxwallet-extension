import {
  useDisclosure,
  ChakraBaseProvider,
  useColorMode,
  type ColorMode,
} from "@chakra-ui/react";
import React, { useEffect, useImperativeHandle, useState } from "react";
import ReactDOM from "react-dom/client";
import { theme } from "../theme";
import { popupEvents } from "./event";
import { Emitter } from "mitt";
import { useDataRef } from "../../hooks/useDataRef";

export interface ModalProps {
  isOpen: boolean;
}

export interface RawChooseDialogProps<T> {
  onConfirm: (resp: T) => void | Promise<void>;
  onCancel: () => void;
}

export type RawChooseDialog<OtherProps, T> = (
  props: RawChooseDialogProps<T> & ModalProps & OtherProps,
) => JSX.Element;

function ChooseDialogWrapper<OtherProps = Record<string, any>, T = undefined>(
  props: RawChooseDialogProps<T> & {
    Dialog: RawChooseDialog<OtherProps, T>;
  },
) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { Dialog } = props;

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const onConfirm = async (resp: T) => {
    void props.onConfirm(resp);
    onClose();
  };

  const onCancel = () => {
    props.onCancel();
    onClose();
  };

  return (
    <Dialog
      {...(props as OtherProps)}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export function promisifyChooseDialogWrapper<
  OtherProps = Record<string, any>,
  T = undefined,
>(Dialog: RawChooseDialog<OtherProps, T>) {
  return async (
    props: Omit<
      OtherProps,
      keyof ModalProps | keyof RawChooseDialogProps<T>
    > = {} as OtherProps,
  ) => {
    const id = Date.now();

    return await new Promise<{ confirmed: boolean; data: T | undefined }>(
      (resolve, reject) => {
        const onConfirm = async (resp: T) => {
          resolve({ confirmed: true, data: resp });
        };
        const onCancel = () => {
          resolve({ confirmed: false, data: undefined });
        };
        popupEvents.emit(
          "showDialog",
          <ChooseDialogWrapper
            key={id}
            {...props}
            onConfirm={onConfirm}
            onCancel={onCancel}
            Dialog={Dialog}
          />,
        );
      },
    );
  };
}

// export interface RawConfirmDialogProps<T> {
//   onConfirm: (resp: T) => void | Promise<void>;
// }

// export type RawConfirmDialog<OtherProps, T> = (
//   props: RawConfirmDialogProps<T> & ModalProps & OtherProps,
// ) => JSX.Element;

// function ConfirmDialogWrapper<OtherProps = Record<string, any>, T = undefined>(
//   props: RawConfirmDialogProps<T> & {
//     Dialog: RawConfirmDialog<OtherProps, T>;
//   },
// ) {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const { Dialog } = props;

//   useEffect(() => {
//     onOpen();
//   }, [onOpen]);

//   const onConfirm = async (resp: T) => {
//     props.onConfirm(resp);
//     onClose();
//   };

//   return (
//     <Dialog
//       {...(props as OtherProps)}
//       isOpen={isOpen}
//       onClose={onClose}
//       onConfirm={onConfirm}
//     />
//   );
// }

// export function promisifyConfirmDialogWrapper<
//   OtherProps = Record<string, any>,
//   T = undefined,
// >(Dialog: RawChooseDialog<OtherProps, T>) {
//   return async (
//     props: Omit<
//       OtherProps,
//       keyof ModalProps | keyof RawChooseDialogProps<T>
//     > = {} as OtherProps,
//   ) => {
//     const id = Date.now();

//     return await new Promise<{ confirmed: boolean; data: T | undefined }>(
//       (resolve, reject) => {
//         const onConfirm = async (resp: T) => {
//           resolve({ confirmed: true, data: resp });
//         };
//         const onCancel = async () => {
//           resolve({ confirmed: false, data: undefined });
//         };
//         popupEvents.emit(
//           "showDialog",
//           <ConfirmDialogWrapper
//             key={id}
//             {...props}
//             onConfirm={onConfirm}
//             onCancel={onCancel}
//             Dialog={Dialog}
//           />,
//         );
//       },
//     );
//   };
// }

export const GlobalModal = () => {
  const [Dialog, setDialog] = useState<JSX.Element | null>(null);
  const { setColorMode } = useColorMode();

  useEffect(() => {
    popupEvents.on("showDialog", (node: JSX.Element) => {
      setDialog(node);
    });

    popupEvents.on("changeColorMode", (colorMode: ColorMode) => {
      setColorMode(colorMode);
    });

    return () => {
      popupEvents.off("showDialog");
      popupEvents.off("changeColorMode");
    };
  }, []);

  if (!Dialog) {
    return null;
  }

  return Dialog;
};
