"use client";

import React, { JSX } from "react";
import { GraphNode, NodeType } from "@/types/GraphTypes";

interface Position {
  x: number;
  y: number;
}

interface MenuComponentProps {
  node: GraphNode | null;
  position: Position;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
  isSeparator?: boolean;
}

const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const ConnectionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"></path>
    <path d="M22 17a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3z"></path>
    <path d="M10 14v-2a2 2 0 0 1 2-2h2"></path>
  </svg>
);
const TweetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 3 5.2-1.4 1-3.2 1.3-4.5 1-2.4 2.3-5.3 4.5-8.5 4.5-2.3 0-4-1.2-5.1-2.5.8.1 1.7-.2 2.4-.7-1.3-.4-2.3-1.5-2.6-2.9.3.1.6.1.9.1-1.3-.6-2.2-1.8-2.2-3.2 0-.1 0-.1 0 0 .5.3 1 .4 1.5.4-1.2-.8-2-2.3-2-4 0-1.1.3-2.1 1-3 .9.9 2.1 1.7 3.5 2.3.4-.8 1.3-1.4 2.3-1.4 1.2 0 2.2.9 2.5 2.1.6-.1 1.2-.3 1.7-.6-.2.6-.6 1.1-1.2 1.5.5-.1 1-.2 1.5-.4z"></path>
  </svg>
);
const HashtagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
);
const HideIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

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
            label: "Show Profile",
            icon: <ProfileIcon />,
            onClick: () => console.log("Show profile:", node.id),
          },
          {
            label: "Show Connections",
            icon: <ConnectionsIcon />,
            onClick: () => console.log("Show connections:", node.id),
          },
          commonHideItem,
        ];
      case NodeType.TWEET:
        return [
          {
            label: "Show Tweet",
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
            label: "Show Related",
            icon: <TweetIcon />,
            onClick: () => console.log("Show related tweets:", node.id),
          },
          {
            label: "Filter by Hashtag",
            icon: <HashtagIcon />,
            onClick: () => console.log("Filter by hashtag:", node.id),
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
      <div className="fixed inset-0 z-50" onClick={onClose} />

      <div
        className="fixed z-50 min-w-[200px] animate-fade-in-scale rounded-lg shadow-2xl bg-[#262631] border border-[#3f3f4d] py-1.5"
        style={{ top: position.y, left: position.x }}
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
