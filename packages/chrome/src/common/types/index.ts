import { ReactNode } from "react";

export interface IStyleProps {
  className?: string;
}

export type INodeProps = IStyleProps & {
  children?: ReactNode;
};
