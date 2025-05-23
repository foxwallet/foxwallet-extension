import { ColorMode } from "@chakra-ui/react";
import mitt, { type Emitter } from "mitt";

export interface ApiClientEventListeners {
  showDialog: (node: JSX.Element) => void;
  changeColorMode: (colorMode: any) => void;
}
export type ApiClientEvent = keyof ApiClientEventListeners;
export type ApiClientEventsMap = {
  [E in ApiClientEvent]: Parameters<ApiClientEventListeners[E]>[0];
};

type Events = Emitter<ApiClientEventsMap>;

export const popupEvents: Events = mitt();
