import React, { useEffect, useRef, useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { MenuItemComponentProps } from '@/app/interface/Menu';

const MenuItem: React.FC<MenuItemComponentProps> = ({
  label,
  icon,
  onMenuItemClick,
  isActive = false,
  submenu,
  onItemActivated,
  isDisabled,
}) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const baseClasses = 'flex items-center gap-3 px-3 py-1.5 text-sm transition-colors duration-150 rounded-md mx-1';
  const stateClasses = isActive ? 'text-neutral-100 bg-[#3f3f4d] cursor-pointer' : 'text-neutral-200 hover:bg-[#3f3f4d] cursor-pointer';
  const disabledClasses = isDisabled ? 'text-neutral-500 cursor-not-allowed hover:bg-transparent opacity-70' : '';

  const hasSubmenu = submenu && submenu.length > 0;

  const handleClick = () => {
    if (isDisabled) return;
    if (hasSubmenu) {
      setShowSubmenu(!showSubmenu);
    } else if (onMenuItemClick) {
      onItemActivated(onMenuItemClick);
    }
  };

  const handleMouseEnter = () => {
    if (isDisabled) return;
    if (hasSubmenu) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowSubmenu(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDisabled) return;
    if (hasSubmenu) {
      timeoutRef.current = setTimeout(() => {
        setShowSubmenu(false);
      }, 100);
    }
  };

  const handleSubmenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSubmenuMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowSubmenu(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Position submenu dynamically based on available space
  useEffect(() => {
    if (showSubmenu && itemRef.current && submenuRef.current) {
      const itemRect = itemRef.current.getBoundingClientRect();
      const submenuRect = submenuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let leftPosition = itemRect.width;
      let topPosition = 0;

      if (itemRect.right + submenuRect.width > viewportWidth) {
        leftPosition = -submenuRect.width;
      }

      if (itemRect.top + submenuRect.height > viewportHeight) {
        topPosition = viewportHeight - itemRect.top - submenuRect.height - 8;
      }

      submenuRef.current.style.left = `${leftPosition}px`;
      submenuRef.current.style.top = `${topPosition}px`;
    }
  }, [showSubmenu]);

  return (
    <div
      ref={itemRef}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} relative`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="menuitem"
      aria-disabled={isDisabled}
    >
      {icon && <span className="text-neutral-400">{icon}</span>}
      <span className="flex-1">{label}</span>
      {hasSubmenu && (
        <span className={`text-neutral-400 ${isDisabled ? 'opacity-40' : ''}`}>
          <ChevronRightIcon />
        </span>
      )}

      {hasSubmenu && showSubmenu && !isDisabled && (
        <div
          ref={submenuRef}
          className="absolute w-[240px] animate-fade-in-scale rounded-lg shadow-2xl bg-[#262631] border border-[#3f3f4d] py-1.5 z-[60]"
          onMouseEnter={handleSubmenuMouseEnter}
          onMouseLeave={handleSubmenuMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {submenu.map((subItem, index) => (
            <React.Fragment key={`${subItem.label}-${index}`}>
              {subItem.isSeparator && <div className="h-[1px] bg-[#3f3f4d] my-1" role="separator" />}
              <MenuItem {...subItem} onItemActivated={onItemActivated} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
