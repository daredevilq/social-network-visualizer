import { Hash, Heart, MessageCircle, Repeat, Zap } from 'lucide-react';
import { ViralTweet } from '@/types/tweetTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/Popups/Tooltip';

interface HashtagTopTweetsContainerProps {
  tweets: ViralTweet[] | undefined;
}

const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

export default function HashtagTopTweetsContainer({ tweets }: HashtagTopTweetsContainerProps) {
  if (!tweets) {
    return (
      <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Hash className="mr-2 text-[#7140F4]" />
          Top Tweets
        </h2>
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-[#363A4D] rounded-md animate-pulse border border-gray-600" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">Top Tweets</h2>
      <TooltipProvider>
        <div className="flex flex-col gap-4">
          {tweets.length === 0 && <p className="text-gray-400 text-center text-sm py-4">No top tweets found for this hashtag.</p>}
          {tweets.map((tweet) => (
            <a
              key={tweet.tweetId}
              href={tweet.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-4 bg-[#363A4D] rounded-lg border border-gray-600 hover:bg-[#40455a] transition-colors cursor-pointer"
            >
              <div className="mb-4">
                <span className="font-bold text-white">@{tweet.userName}</span>
                <p className="text-gray-300 text-sm mt-1">{tweet.preview}</p>
              </div>

              <div className="border-b border-gray-600 mb-3"></div>
              <div className="flex items-center justify-between text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-yellow-400 hover:cursor-pointer">
                      <Zap size={16} />
                      <span className="font-medium">{formatNumber(tweet.engagementScore)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Engagement Score</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-2 md:gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-red-400 hover:cursor-pointer">
                        <Heart size={16} />
                        <span className="font-medium">{formatNumber(tweet.likes)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Likes</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-teal-400 hover:cursor-pointer">
                        <Repeat size={16} />
                        <span className="font-medium">{formatNumber(tweet.retweets)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Retweets</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-blue-400 hover:cursor-pointer">
                        <MessageCircle size={16} />
                        <span className="font-medium">{formatNumber(tweet.replies)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Replies</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </a>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
