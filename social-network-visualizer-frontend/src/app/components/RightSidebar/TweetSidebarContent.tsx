'use client';
import { useEffect, useState } from 'react';
import { User2, X, MessageCircle } from 'lucide-react';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { TweetDetails } from '@/types/tweetTypes';
import TweetCard from '@/app/components/Analysis/Tweet/TweetCard';
import { useProject } from '@/app/context/ProjectContext';
import { GraphNode, NodeType } from '@/types/GraphTypes';

interface TweetSidebarContentProps {
  selectedUserData: BasicUserData;
  onClose: () => void;
}

export const TweetSidebarContent = (props: TweetSidebarContentProps) => {
  const { selectedUserData, onClose } = props;
  const [tweet, setTweet] = useState<TweetDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();
  const { setSelectedUserData, projectData } = useProject();
  const { runWithUnsavedCheck } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (selectedUserData?.id) fetchTweetData();
  }, [selectedUserData]);

  const fetchTweetData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tweet/${selectedUserData.id}`);
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

  const goToParentTweet = (tweetId: string) => {
    runWithUnsavedCheck(async () => {
      const tweetNode = projectData.nodes.find((n: GraphNode) => n.id === tweetId && n.nodeType === NodeType.TWEET);

      setSelectedUserData({
        id: tweetId,
        name: tweetNode?.name || tweetId,
        community: '',
        nodeType: NodeType.TWEET,
      });
    });
  };

  const scrollbarClass = `
    [scrollbar-width:thin] [scrollbar-color:#7140F4_transparent]
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#7140F4] [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-[#5a33c4]
  `;

  return (
    <div className="p-5 h-full flex flex-col text-white">
      <div className="flex items-center justify-between border-b border-[#3D3D4E] pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7140F4] to-[#9b6dff] flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
            <MessageCircle size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tweet Details</h1>
            <p className="text-xs text-gray-400">Post Information</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-[#2A2D3D] hover:bg-[#3D3D4E] text-gray-400 hover:text-white rounded-full transition-colors duration-200 cursor-pointer"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="h-40 bg-[#3D3D4E] rounded-lg animate-pulse" />
      ) : tweet ? (
        <div className={`flex flex-col space-y-4 overflow-y-auto ${scrollbarClass} pr-1`}>
          <div className="bg-[#2A2D3D] rounded-xl p-4 border border-[#3D3D4E]/50 shadow-md">
            <h3 className="text-sm font-semibold mb-3 text-gray-300 uppercase tracking-wide">Author</h3>

            <div
              onClick={() => goToAuthor()}
              className="flex items-center justify-between bg-[#3D3D4E] hover:bg-[#4D4D5E]
                 px-4 py-3 rounded-xl text-sm text-gray-100 transition-all duration-200
                 cursor-pointer hover:shadow-md hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full
                        bg-[#7140F4] text-white shadow-md group-hover:bg-[#8b61ff] transition-colors"
                >
                  <User2 size={16} />
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
                className="px-3 py-1.5 text-xs bg-[#7140F4] hover:bg-[#5c32c3] text-white rounded-md
                   transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer font-medium"
              >
                Profile
              </button>
            </div>
          </div>

          {tweet.mentions && tweet.mentions.length > 0 && (
            <div className="bg-[#2A2D3D] rounded-xl p-4 border border-[#3D3D4E]/50 shadow-md">
              <h3 className="text-sm font-semibold mb-3 text-gray-300 uppercase tracking-wide">Mentioned Users</h3>
              <div className="flex flex-col space-y-2">
                {tweet.mentions.map((user, i) => (
                  <div
                    key={user}
                    onClick={() => router.push(`/user-details/${user}`)}
                    className="flex items-center justify-between bg-[#3D3D4E] hover:bg-[#4D4D5E]
                       px-4 py-3 rounded-xl text-sm text-gray-100 transition-all duration-200
                       cursor-pointer hover:shadow-md hover:scale-[1.01] group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full
                            bg-[#7140F4] text-white shadow-md group-hover:bg-[#8b61ff] transition-colors"
                      >
                        <User2 size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate font-medium text-gray-200">{user}</span>
                        <span className="text-xs text-gray-400">@{user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-300 uppercase tracking-wide px-1">Content</h3>
            <TweetCard tweet={tweet} hoverable={false} />
          </div>

          {tweet.replyToId && (
            <div className="bg-[#2A2D3D] rounded-xl p-4 border border-[#3D3D4E]/50 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="overflow-hidden mr-2">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">In Reply To</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 truncate" title={tweet.replyToId}>
                    {tweet.replyToId}
                  </p>
                </div>

                <button
                  onClick={() => goToParentTweet(tweet.replyToId!)}
                  className="px-3 py-1.5 text-xs border border-[#7140F4] text-[#7140F4] hover:bg-[#7140F4] hover:text-white rounded-md
                   transition-all duration-300 cursor-pointer font-medium whitespace-nowrap"
                >
                  View Parent
                </button>
              </div>

              {tweet.replyToContent && (
                <div className="bg-[#1a1a24] p-3 rounded-lg border-l-2 border-[#7140F4]">
                  <p className="text-sm italic text-gray-400 break-words">
                    “{tweet.replyToContent.slice(0, 150)}
                    {tweet.replyToContent.length > 150 ? '...' : ''}”
                  </p>
                </div>
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
