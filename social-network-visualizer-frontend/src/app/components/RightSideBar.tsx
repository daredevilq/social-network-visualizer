'use client';
import { NodeType } from '@/types/GraphTypes';
import { AuthorSidebarContent } from '@/app/components/RightSidebar/AuthorSidebarContent';
import { TweetSidebarContent } from '@/app/components/RightSidebar/TweetSidebarContent';
import { HashtagSidebarContent } from '@/app/components/RightSidebar/HashtagSidebarContent';
import { useProject } from '@/app/context/ProjectContext';

export default function RightSidebar() {
  const { isSidebarOpen, selectedUserData, setIsSidebarOpen } = useProject();
  const onClose = () => setIsSidebarOpen(false);

  if (!selectedUserData) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-96 shadow-lg z-40 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } bg-gradient-to-b from-[#262631] to-[#1E1E29] border-l border-[#383845]`}
    >
      {selectedUserData.nodeType === NodeType.AUTHOR && <AuthorSidebarContent selectedUserData={selectedUserData} onClose={onClose} />}
      {selectedUserData.nodeType === NodeType.TWEET && <TweetSidebarContent selectedUserData={selectedUserData} onClose={onClose} />}
      {selectedUserData.nodeType === NodeType.HASHTAG && <HashtagSidebarContent selectedUserData={selectedUserData} onClose={onClose} />}
    </div>
  );
}
