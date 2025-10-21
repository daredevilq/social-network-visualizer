"use client";

import React from "react";
import { NodeType } from "@/types/GraphTypes";
import { MenuComponentProps, MenuItem } from "@/app/interface/Menu";
import {
  ConnectionsIcon,
  HashtagIcon,
  HideIcon,
  ProfileIcon,
  TweetIcon,
} from "./MenuIcons";

const MenuComponent: React.FC<MenuComponentProps> = ({
  node,
  position,
  onClose,
}) => {
  if (!node) return null;

  const getMenuItems = (nodeType: NodeType): MenuItem[] => {
    const commonHideItem: MenuItem = {
      label: "Hide Node",
      icon: <HideIcon />,
      onClick: () => console.log("Hide node:", node.id),
      isSeparator: true,
    };

    switch (nodeType) {
      case NodeType.AUTHOR:
        return [
          {
            label: "Show Top 10 Tweets",
            icon: <ProfileIcon />,
            onClick: () => console.log("Show Top 10 Tweets:", node.id),
          },
          {
            label: "Show most related users",
            icon: <ConnectionsIcon />,
            onClick: () => console.log("Show connections:", node.id),
          },
          commonHideItem,
        ];
      case NodeType.TWEET:
        return [
          {
            label: "Show hashtags",
            icon: <TweetIcon />,
            onClick: () => console.log("Show tweet:", node.id),
          },
          {
            label: "Show Author",
            icon: <ProfileIcon />,
            onClick: () => console.log("Show author for tweet:", node.id),
          },
          commonHideItem,
        ];
      case NodeType.HASHTAG:
        return [
          {
            label: "Show Top 10 authors",
            icon: <TweetIcon />,
            onClick: () => console.log("Show Top 10 authors:", node.id),
          },
          {
            label: "Show Top 10 tweets",
            icon: <HashtagIcon />,
            onClick: () => console.log("Show Top 10 tweets:", node.id),
          },
          commonHideItem,
        ];
      default:
        return [];
    }
  };

  const handleItemClick = (handler: () => void) => {
    handler();
    onClose();
  };

  const menuItems = getMenuItems(node.nodeType);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/10" onClick={onClose} />

      <div
        className="fixed z-50 min-w-[200px] animate-fade-in-scale rounded-lg shadow-2xl bg-[#262631] border border-[#3f3f4d] py-1.5"
        style={{ top: position.y, left: position.x }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.isSeparator && <div className="h-[1px] bg-[#3f3f4d] my-1" />}
            <div
              className="flex items-center gap-3 px-3 py-1.5 text-sm text-neutral-200 hover:bg-[#3f3f4d] cursor-pointer transition-colors duration-150 rounded-md mx-1"
              onClick={() => handleItemClick(item.onClick)}
            >
              <span className="text-neutral-400">{item.icon}</span>
              <span>{item.label}</span>
            </div>
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
      `}</style>
    </>
  );
};

export default MenuComponent;
