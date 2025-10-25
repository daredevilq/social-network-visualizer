import React from "react";
import { MenuItem as MenuItemProps } from "@/app/interface/Menu";

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  icon,
  onClick,
  isActive = false,
}) => {
  const baseClasses =
    "flex items-center gap-3 px-3 py-1.5 text-sm transition-colors duration-150 rounded-md mx-1";
  const stateClasses = isActive
    ? "text-neutral-100 bg-[#3f3f4d] cursor-pointer"
    : "text-neutral-200 hover:bg-[#3f3f4d] cursor-pointer";

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      role="menuitem"
    >
      {icon && <span className="text-neutral-400">{icon}</span>}
      <span className="flex-1">{label}</span>
    </div>
  );
};

export default MenuItem;
