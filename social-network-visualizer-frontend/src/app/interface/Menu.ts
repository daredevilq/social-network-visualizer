import { JSX } from "react";
import { GraphNode } from "@/types/GraphTypes";

export interface Position {
  x: number;
  y: number;
}

export interface MenuComponentProps {
  node: GraphNode | null;
  position: Position;
  onClose: () => void;
}

export interface MenuItem {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
  isSeparator?: boolean;
}
