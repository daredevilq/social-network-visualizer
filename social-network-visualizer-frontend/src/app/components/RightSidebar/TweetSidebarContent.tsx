'use client';
import { useEffect, useState } from 'react';
import { User2, X } from 'lucide-react';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { TweetDetails } from '@/types/tweetTypes';
import TweetCard from '@/app/components/Analysis/Tweet/TweetCard';
import { useProject } from '@/app/context/ProjectContext';
import { NodeType } from '@/types/GraphTypes';

interface TweetSidebarContentProps {
  selectedUserData: BasicUserData;
  onClose: () => void;
}

export const TweetSidebarContent = (props: TweetSidebarContentProps) => {
  const { selectedUserData, onClose } = props;
  const [tweet, setTweet] = useState<TweetDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();
  const { setSelectedUserData } = useProject();
  const { runWithUnsavedCheck } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (selectedUserData?.name) fetchTweetData();
  }, [selectedUserData]);

  const fetchTweetData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tweet/${selectedUserData.name}`);
      if (!res.ok) throw new Error('Failed to load tweet data');
      const data = await res.json();
      setTweet(data);
    } catch (err) {
      showNotification('Failed to load tweet data.', BannerType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const goToAuthor = () => {
    if (tweet?.authorName) {
      runWithUnsavedCheck(async () => router.push(`/user-details/${tweet.authorName}`));
    }
  };

  const goToParentTweet = (id: string) => {
    runWithUnsavedCheck(async () => {
      setSelectedUserData({
        name: id,
        community: '',
        nodeType: NodeType.TWEET,
      });
    });
  };

  return (
    <div className="p-5 h-full flex flex-col text-white">
      <div className="flex items-center justify-between border-b border-[#3D3D4E] pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#40A0F4] to-[#6FC1FF] flex items-center justify-center text-lg font-semibold">
            T
          </div>
          <div>
            <h1 className="text-xl font-bold">Tweet</h1>
            <p className="text-xs text-gray-400">
              ID:{' '}
              {selectedUserData?.name &&
                (selectedUserData.name.length > 25 ? selectedUserData.name.slice(0, 25) + '...' : selectedUserData.name)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-[#32323F] hover:bg-[#3D3D4E] text-white rounded-full shadow-md transition-colors duration-200"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="h-40 bg-[#3D3D4E] rounded-lg animate-pulse" />
      ) : tweet ? (
        <div className="flex flex-col space-y-4 overflow-y-auto  scrollbar-none">
          <div className="bg-[#32323F] rounded-xl p-4 border border-[#3D3D4E]/50 shadow-md">
            <h3 className="text-lg font-semibold mb-3">Author</h3>

            <div
              onClick={() => goToAuthor()}
              className="flex items-center justify-between bg-[#3D3D4E] hover:bg-[#4D4D5E]
                 px-5 py-3 rounded-xl text-sm text-gray-100 transition-all duration-200
                 cursor-pointer hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full
                        bg-gradient-to-r from-[#7140F4] to-[#40A0F4] text-white shadow-md"
                >
                  <User2 size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="truncate font-medium text-gray-200">{tweet.authorName}</span>
                  {tweet.authorName && <span className="text-xs text-gray-400">@{tweet.authorName}</span>}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runWithUnsavedCheck(async () => goToAuthor());
                }}
                className="px-3 py-1 text-xs bg-[#7140F4] hover:bg-[#5c32c3] text-white rounded-md
                   transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                View Profile
              </button>
            </div>
          </div>

          <TweetCard tweet={tweet} hoverable={false} />

          {tweet.mentions && tweet.mentions.length > 0 && (
            <div className="bg-[#32323F] rounded-xl p-4 border border-[#3D3D4E]/50 shadow-md">
              <h3 className="text-lg font-semibold mb-3">Mentioned Users</h3>
              <div className="flex flex-col space-y-2">
                {tweet.mentions.map((user, i) => (
                  <div
                    key={user}
                    onClick={() => router.push(`/user-details/${user}`)}
                    className="flex items-center justify-between bg-[#3D3D4E] hover:bg-[#4D4D5E] px-5 py-3 rounded-xl text-sm text-gray-100 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                        <User2 size={18} />
                      </div>
                      <span className="truncate font-medium text-gray-200">{user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tweet.replyToId && (
            <div className="bg-[#32323F] rounded-xl p-4 border border-[#3D3D4E]/50 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-lg font-semibold">Reply To</h3>
                  <p className="text-sm text-gray-300 mb-2">Tweet ID: {tweet.replyToId}</p>
                </div>

                <button
                  onClick={() => goToParentTweet(tweet.replyToId!)}
                  className="px-3 py-1 text-xs bg-[#7140F4] hover:bg-[#5c32c3] text-white rounded-md
                   transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  View Parent Tweet
                </button>
              </div>

              {tweet.replyToContent && (
                <p className="text-sm italic text-gray-400 border-l-2 border-[#40A0F4] pl-3">“{tweet.replyToContent.slice(0, 100)}...”</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-center bg-[#3D3D4E]/30 rounded-lg border border-dashed border-[#3D3D4E]">
          <p className="text-gray-400 italic mb-1">No tweet data available</p>
          <p className="text-xs text-gray-500">This tweet could not be loaded</p>
        </div>
      )}
    </div>
  );
};
