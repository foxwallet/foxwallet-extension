import { useDisclosure, ChakraBaseProvider } from "@chakra-ui/react";
import React, { useEffect, useImperativeHandle, useState } from "react";
import ReactDOM from "react-dom/client";
import { theme } from "../theme";
import { popupEvents } from "./event";
import { Emitter } from "mitt";
import { useDataRef } from "../../hooks/useDataRef";

export interface ModalProps {
  isOpen: boolean;
}

export interface RawConfirmDialogProps<T> {
  onConfirm: (resp: T) => void | Promise<void>;
  onCancel: () => void;
}

export type RawConfirmDialog<OtherProps, T> = (
  props: RawConfirmDialogProps<T> & ModalProps & OtherProps
) => JSX.Element;

// export function promisifyConfirmDialogWrapper<OtherProps = {}, T = undefined>(
//   Dialog: RawConfirmDialog<OtherProps, T>
// ) {
//   return (
//     props: Omit<
//       OtherProps,
//       keyof ModalProps | keyof RawConfirmDialogProps<T>
//     > = {} as OtherProps
//   ) => {
//     return new Promise<{ confirmed: boolean; data: T | undefined }>(
//       (resolve, reject) => {
//         const { isOpen, onOpen, onClose } = useDisclosure();

//         useEffect(() => {
//           onOpen();
//         }, []);
//         const onConfirm = async (resp: T) => {
//           resolve({ confirmed: true, data: resp });
//         };
//         const onCancel = () => {
//           onClose();
//           resolve({ confirmed: false, data: undefined });
//         };
//         if (isOpen) {
//           return ReactDOM.createPortal(
//             <Dialog
//               {...(props as OtherProps)}
//               isOpen={isOpen}
//               onClose={onClose}
//               onConfirm={onConfirm}
//               onCancel={onCancel}
//             />,
//             document.getElementById("modal-root")!
//           );
//         }
//         return null;
//       }
//     );
//   };
// }

function ConfirmDialogWrapper<OtherProps = Record<string, any>, T = undefined>(
  props: RawConfirmDialogProps<T> & {
    Dialog: RawConfirmDialog<OtherProps, T>;
  }
) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { Dialog } = props;

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const onConfirm = async (resp: T) => {
    props.onConfirm(resp);
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

export function promisifyConfirmDialogWrapper<
  OtherProps = Record<string, any>,
  T = undefined,
>(Dialog: RawConfirmDialog<OtherProps, T>) {
  return async (
    props: Omit<
      OtherProps,
      keyof ModalProps | keyof RawConfirmDialogProps<T>
    > = {} as OtherProps
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
          <ConfirmDialogWrapper
            key={id}
            {...props}
            onConfirm={onConfirm}
            onCancel={onCancel}
            Dialog={Dialog}
          />
        );
      }
    );
  };
}

export const GlobalModal = () => {
  const [Dialog, setDialog] = useState<JSX.Element | null>(null);

  useEffect(() => {
    popupEvents.on("showDialog", (node: JSX.Element) => {
      setDialog(node);
    });

    return () => {
      popupEvents.off("showDialog");
    };
  }, []);

  if (!Dialog) {
    return null;
  }

  return Dialog;
};
