"use client";
import React from "react";
import { MenuComponentProps, MenuDefinition } from "@/app/interface/Menu";
import MenuItem from "@/app/components/graphMenu/MenuItem";

const MenuComponent: React.FC<MenuComponentProps> = ({
  items,
  position,
  onClose,
}) => {
  if (!items || items.length === 0) return null;

  const handleItemClickAndCloseMenu = (handler: () => void) => {
    handler();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/10" onClick={onClose} />

      <div
        className="fixed z-50 min-w-[200px] animate-fade-in-scale rounded-lg shadow-2xl bg-[#262631] border border-[#3f3f4d] py-1.5"
        style={{ top: position.y, left: position.x }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((menuItem: MenuDefinition, index: number) => (
          <React.Fragment key={`${menuItem.label}-${index}`}>
            {menuItem.isSeparator && (
              <div className="h-[1px] bg-[#3f3f4d] my-1" role="separator" />
            )}

            <MenuItem
              label={menuItem.label}
              icon={menuItem.icon}
              onMenuItemClick={menuItem.onMenuItemClick}
              isActive={menuItem.isActive}
              submenu={menuItem.submenu}
              onItemActivated={handleItemClickAndCloseMenu}
            />
          </React.Fragment>
        ))}
      </div>

      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.1s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default MenuComponent;
