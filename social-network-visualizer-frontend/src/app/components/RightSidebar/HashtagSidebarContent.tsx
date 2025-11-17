'use client';
import { useEffect, useState } from 'react';
import { X, ExternalLink, User2 } from 'lucide-react';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { BannerType } from '@/app/components/Popups/Banner';
import { useNotification } from '@/app/context/NotificationProvider';
import { useRouter } from 'next/navigation';
import { NodeType } from '@/types/GraphTypes';
import { useProject } from '@/app/context/ProjectContext';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { HashtagDetailsDto } from '@/app/interface/HashtagData';

interface HashtagSidebarContentProps {
  selectedUserData: BasicUserData;
  onClose: () => void;
}

export const HashtagSidebarContent = ({ selectedUserData, onClose }: HashtagSidebarContentProps) => {
  const [hashtagStats, setHashtagStats] = useState<HashtagDetailsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();
  const { setSelectedUserData } = useProject();
  const { runWithUnsavedCheck } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (selectedUserData?.name) fetchHashtagData();
  }, [selectedUserData]);

  const fetchHashtagData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hashtag/${selectedUserData.name}/sidebarDetails`);
      if (!res.ok) throw new Error('Failed to load hashtag data');
      const data: HashtagDetailsDto = await res.json();
      setHashtagStats(data);
    } catch (err) {
      showNotification('Failed to load hashtag data.', BannerType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const goToTweet = (id: string) => {
    runWithUnsavedCheck(async () => {
      setSelectedUserData({
        name: id,
        community: '',
        nodeType: NodeType.TWEET,
      });
    });
  };

  const truncatePreview = (url: string, maxLength: number = 35) => {
    if (url.length <= maxLength) return url;
    const start = url.substring(0, maxLength / 2);
    const end = url.substring(url.length - maxLength / 2);
    return `${start}...${end}`;
  };

  const showDetails = () => {
    if (selectedUserData) {
      router.push(`/hashtag-details/${selectedUserData.name}`);
    }
  };

  return (
    <div className="p-5 h-full flex flex-col text-white scrollbar-none">
      <div className="flex items-center justify-between border-b border-[#3D3D4E] pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F48C06] via-[#F9C74F] to-[#FFD166] flex items-center justify-center text-lg font-semibold text-black shadow-lg">
            #
          </div>
          <div>
            <h1 className="text-xl font-bold">#{selectedUserData?.name}</h1>
            <p className="text-xs text-gray-400">Hashtag Overview</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-[#2A2D3D] hover:bg-[#3D3D4E] text-white rounded-full shadow-md transition-colors duration-200"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
        {hashtagStats ? (
          <div className="flex flex-col space-y-4 overflow-y-auto scrollbar-none">
            <div className="bg-[#2A2D3D] rounded-xl p-4 shadow-md backdrop-blur-sm border border-[#3D3D4E]/50 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top Users</h3>
                <button
                  onClick={() => runWithUnsavedCheck(async () => showDetails())}
                  className="px-3 py-1 text-xs bg-[#7140F4] hover:bg-[#5c32c3] text-white rounded-md transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Show details
                </button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-[#3D3D4E] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : hashtagStats.topAuthors && hashtagStats.topAuthors.length > 0 ? (
                <div className="flex flex-col space-y-2">
                  {hashtagStats.topAuthors.map((user) => (
                    <div
                      key={user.username}
                      onClick={() => router.push(`/user-details/${user.username}`)}
                      className="flex items-center justify-between bg-[#3D3D4E] hover:bg-[#4D4D5E]
                        px-5 py-3 rounded-xl text-sm text-gray-100 transition-all duration-200
                        cursor-pointer hover:shadow-md hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-full
                          bg-gradient-to-r from-[#F48C06] to-[#FFD166] text-black font-semibold shadow-md"
                        >
                          <User2 size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate font-medium text-gray-200">{user.username}</span>
                          <span className="text-xs text-gray-400">{user.count} tweets</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-center text-gray-400 italic">No top users found</div>
              )}
            </div>

            <div className="bg-[#2A2D3D] rounded-xl p-4 shadow-md flex-1 max-h-fit backdrop-blur-sm border border-[#3D3D4E]/50 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top 3 Posts</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-dark">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-[#3D3D4E] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : hashtagStats.topTweets && hashtagStats.topTweets.length > 0 ? (
                  <div className="space-y-3">
                    {hashtagStats.topTweets.map(({ tweetId, preview, tweetUrl }, index) => (
                      <div
                        key={index}
                        onClick={() => goToTweet(tweetId)}
                        className="block bg-gradient-to-r from-[#3D3D4E] to-[#454557] hover:from-[#454557] hover:to-[#505063] p-4 rounded-lg transition-all duration-200 border border-[#3D3D4E]/70 hover:border-[#7140F4]/70 cursor-pointer hover:shadow-lg"
                      >
                        <p className="text-sm truncate mb-3" title={preview || ''}>
                          {preview ? truncatePreview(preview) : 'no preview available'}
                        </p>
                        <div className="flex items-center justify-between">
                          <a
                            href={tweetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#9C6FFF] text-xs flex items-center hover:underline"
                          >
                            <span>View on Twitter</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>

                          <span className="text-xs text-gray-400">{`Post ${index + 1}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center bg-[#3D3D4E]/30 rounded-lg border border-dashed border-[#3D3D4E]">
                    <p className="text-gray-400 italic mb-1">No posts available</p>
                    <p className="text-xs text-gray-500">This hashtag has no top tweets</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-[#3D3D4E]/30 rounded-lg border border-dashed border-[#3D3D4E]">
            <p className="text-gray-400 italic mb-1">No stats available</p>
            <p className="text-xs text-gray-500">This user has no prominent posts</p>
          </div>
        )}
      </div>
    </div>
  );
};
