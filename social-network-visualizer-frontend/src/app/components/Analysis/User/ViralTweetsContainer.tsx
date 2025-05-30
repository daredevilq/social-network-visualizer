import Link from 'next/link';
import {ViralTweet} from "@/types/tweetTypes"
import { TrendingUp } from 'lucide-react';

export function ViralTweetsContainer({ viralTweets }: { viralTweets: ViralTweet[] }) {

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Most Viral Tweets
            </h2>

            {viralTweets && viralTweets.length > 0 ? (
                <div className="space-y-4">
                    {viralTweets.map((tweet) => (
                        <div
                            key={tweet.tweetUrl}
                            className="bg-[#3D3D4E] rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:bg-[#45455A] hover:translate-y-[-2px] cursor-pointer group"
                        >
                            <div className="p-5" onClick={() => window.open(tweet.tweetUrl, '_blank', 'noopener,noreferrer')}>
                                <div className="flex items-center mb-3">
                                    <Link href={`/user-details/${tweet.userName}`} className="flex items-center group/avatar-nick" onClick={(e) => e.stopPropagation()}>
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#7140F4] flex items-center justify-center text-white font-semibold text-sm"
                                        >
                                            {tweet.userName.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className="ml-3 text-left">
                                            <div className="font-semibold text-white hover:underline">{tweet.userName}</div>
                                            <div className="text-xs text-gray-400">@{tweet.userName.toLowerCase()}</div>
                                        </div>
                                    </Link>
                                </div>

                                <p className="text-sm leading-relaxed text-gray-100 mb-3">{tweet.preview}</p>
                            </div>

                            <div
                                className="flex items-center justify-between p-4 bg-[#36364A] border-t border-[#4D4D6A]">
                                <div className="flex items-center space-x-6">
                                    <div
                                        className="flex items-center gap-1.5 text-sm text-gray-300 group-hover:text-[#8A5CF9] transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                             strokeLinecap="round" strokeLinejoin="round">
                                            <path
                                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span className="font-medium">{tweet.likes.toLocaleString()}</span>
                                    </div>

                                    <div
                                        className="flex items-center gap-1.5 text-sm text-gray-300 group-hover:text-[#8A5CF9] transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                             strokeLinecap="round" strokeLinejoin="round">
                                            <path
                                                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        <span className="font-medium">{tweet.replies.toLocaleString()}</span>
                                    </div>

                                    <div
                                        className="flex items-center gap-1.5 text-sm text-gray-300 group-hover:text-[#8A5CF9] transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                             strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="17 1 21 5 17 9"></polyline>
                                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                            <polyline points="7 23 3 19 7 15"></polyline>
                                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                        </svg>
                                        <span className="font-medium">{tweet.retweets.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div
                                        className="px-3 py-1.5 bg-[#7140F4] rounded-full text-xs font-medium text-white">
                                        Score: {(tweet.engagementScore / 1000).toFixed(1)}K
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            ) : (
                <p className="text-gray-400">No viral tweets available.</p>
            )}
        </div>
    )
}