import React from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onMenuItemClick?: () => void;
  isActive?: boolean;
  isSeparator?: boolean;
  submenu?: MenuItem[];
}

export interface MenuState {
  items: MenuItem[];
  position: Position;
}

export interface MenuDefinition extends MenuItem {}

export interface MenuComponentProps {
  items: MenuItem[];
  position: Position;
  onClose: () => void;
  subMenu?: boolean;
}

export interface MenuItemComponentProps extends MenuItem {
  onItemActivated: (handler: () => void) => void;
}
