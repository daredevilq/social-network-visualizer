'use client';

import { NodeType } from '@/types/GraphTypes';
import { AuthorSidebarContent } from '@/app/components/RightSidebar/AuthorSidebarContent';
import { TweetSidebarContent } from '@/app/components/RightSidebar/TweetSidebarContent';
import { HashtagSidebarContent } from '@/app/components/RightSidebar/HashtagSidebarContent';
import { useProject } from '@/app/context/ProjectContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function RightSidebar() {
  const { isSidebarOpen, selectedUserData, setIsSidebarOpen } = useProject();
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarData, setSidebarData] = useState<typeof selectedUserData>(null);

  const onClose = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (isSidebarOpen && selectedUserData) {
      setSidebarData(selectedUserData);
      setShowSidebar(true);
    } else {
      const timeout = setTimeout(() => {
        setShowSidebar(false);
        setSidebarData(null);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [isSidebarOpen, selectedUserData]);

  if (!sidebarData) return null;

  return (
    <AnimatePresence mode="wait">
      {showSidebar && (
        <motion.div
          key="sidebar"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: isSidebarOpen ? 0 : '100%', opacity: isSidebarOpen ? 1 : 0 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed top-0 right-0 h-full w-full sm:w-96 shadow-lg z-40
                     bg-gradient-to-b from-[#262631] to-[#1E1E29] border-l border-[#383845]"
        >
          {sidebarData.nodeType === NodeType.AUTHOR && <AuthorSidebarContent selectedUserData={sidebarData} onClose={onClose} />}
          {sidebarData.nodeType === NodeType.TWEET && <TweetSidebarContent selectedUserData={sidebarData} onClose={onClose} />}
          {sidebarData.nodeType === NodeType.HASHTAG && <HashtagSidebarContent selectedUserData={sidebarData} onClose={onClose} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
