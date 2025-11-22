'use client';

import GraphTypeContent from '@/app/components/LeftSideBar/GraphTypeContent';
import FunctionsContent from '@/app/components/LeftSideBar/FunctionsContent';
import FiltersContent from '@/app/components/LeftSideBar/FiltersContent';
import HelpContent from '@/app/components/LeftSideBar/HelpContent';
import ProjectsContent from '@/app/components/LeftSideBar/ProjectsContent';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LeftSidebarProps {
  isOpen: boolean;
  selectedLeftSideBarContent: string;
}

export default function LeftSidebar({ isOpen, selectedLeftSideBarContent }: LeftSidebarProps) {
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowSidebar(true);
    } else {
      const timeout = setTimeout(() => setShowSidebar(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const renderLeftSideBarContent = () => {
    switch (selectedLeftSideBarContent) {
      case 'home':
        return null;
      case 'graph':
        return <GraphTypeContent />;
      case 'functions':
        return <FunctionsContent />;
      case 'filters':
        return <FiltersContent />;
      case 'projects':
        return <ProjectsContent />;
      case 'help':
        return <HelpContent />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showSidebar && (
        <motion.div
          key="left-sidebar"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: isOpen ? 0 : '-100%', opacity: isOpen ? 1 : 0 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="
            fixed top-0 left-[60px] h-screen w-full sm:w-80 text-white shadow-lg z-40
            border-r-[1px] border-[#FAFAFA]
            rounded-tr-2xl rounded-br-2xl
            bg-[#262631]
            p-2
          "
        >
          {renderLeftSideBarContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
