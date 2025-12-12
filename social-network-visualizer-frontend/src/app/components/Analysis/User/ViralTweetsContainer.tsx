import Link from 'next/link';
import { ViralTweet } from '@/types/tweetTypes';
import { TrendingUp, MessageCircle, Heart, Repeat2, Zap } from 'lucide-react';

export function ViralTweetsContainer({ viralTweets }: { viralTweets: ViralTweet[] }) {
  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Most Viral Tweets</h2>
      </div>

      {viralTweets && viralTweets.length > 0 ? (
        <div className="space-y-4">
          {viralTweets.map((tweet) => (
            <div
              key={tweet.tweetId}
              onClick={() => window.open(tweet.tweetUrl, '_blank', 'noopener,noreferrer')}
              className="group flex flex-col gap-3 p-5 rounded-xl
                         bg-[#3D3D4E] border border-white/5
                         hover:border-[#7140F4]/50 hover:bg-[#2a2a35]
                         transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Link href={`/user-details/${tweet.userName}`} onClick={(e) => e.stopPropagation()} className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#7140F4] flex items-center justify-center text-white font-bold text-sm">
                      {tweet.userName.substring(0, 1).toUpperCase()}
                    </div>
                  </Link>

                  <div className="flex flex-col">
                    <Link
                      href={`/user-details/${tweet.userName}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-white text-sm hover:text-[#7140F4] transition-colors relative z-10"
                    >
                      {tweet.userName}
                    </Link>
                    <span className="text-xs text-gray-400">@{tweet.userName.toLowerCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#7140F4] to-[#9F7AEA] shadow-sm">
                  <Zap className="w-3 h-3 text-white fill-white" />
                  <span className="text-xs font-bold text-white tracking-wide">{(tweet.engagementScore / 1000).toFixed(1)}K</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-200 pl-[52px]">{tweet.preview}</p>
              <div className="flex items-center gap-6 pl-[52px] mt-2 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 group/stat">
                  <div className="p-1.5 rounded-full bg-rose-500/10 group-hover/stat:bg-rose-500/20 transition-colors">
                    <Heart className="w-3.5 h-3.5 text-rose-500 transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-gray-300 group-hover/stat:text-white transition-colors">
                    {tweet.likes.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 group/stat">
                  <div className="p-1.5 rounded-full bg-sky-500/10 group-hover/stat:bg-sky-500/20 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-sky-500 transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-gray-300 group-hover/stat:text-white transition-colors">
                    {tweet.replies.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 group/stat">
                  <div className="p-1.5 rounded-full bg-emerald-500/10 group-hover/stat:bg-emerald-500/20 transition-colors">
                    <Repeat2 className="w-3.5 h-3.5 text-emerald-500 transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-gray-300 group-hover/stat:text-white transition-colors">
                    {tweet.retweets.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
          <TrendingUp className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm">No viral tweets available.</p>
        </div>
      )}
    </div>
  );
}
