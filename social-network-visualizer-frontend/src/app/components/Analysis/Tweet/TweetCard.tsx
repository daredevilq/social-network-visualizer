import { Heart, Repeat, MessageCircle, Globe, Info } from 'lucide-react';
import { Tweet } from "@/types/tweetTypes";

interface TweetCardProps {
    tweet: Tweet;
}

const TweetCard = ({ tweet }: TweetCardProps) => {
    const highlight = tweet.isHighEngagement;
    const interactionRatio = tweet.engagement;

    return (
        <div className={`bg-[#3D3D4E] rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:bg-[#45455A] hover:-translate-y-1 p-5 ${highlight ? 'ring-2 ring-yellow-400/50 bg-gradient-to-r from-yellow-400/10 to-transparent' : 'border border-[#4D4D6A]'} mb-4`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center mb-2">
                    <div
                        className="w-10 h-10 rounded-full bg-[#7140F4] flex items-center justify-center text-white font-semibold text-sm"
                        aria-label={`Avatar for ${tweet.authorName}`}
                    >
                        {tweet.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                        <a
                            href={`/user-details/${tweet.authorName}`}
                            className="font-semibold text-white hover:underline"
                            aria-label={`Go to ${tweet.authorName} profile`}
                        >
                            {tweet.authorName}
                        </a>
                        <div className="text-xs text-gray-400">@{tweet.authorName.toLowerCase()}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center text-xs px-2 py-1 rounded bg-gray-700">
                        <Info className="w-4 h-4 mr-1" />
                        {tweet.objectType}
                    </span>

                    {highlight && (
                        <div className="relative flex items-center group pl-2">
                            <Info className="w-5 h-5 text-yellow-400 cursor-pointer" />
                            <span className="absolute right-0 top-full mt-1 w-max px-2 py-1 rounded bg-gray-700 text-xs opacity-0 group-hover:opacity-100 transition z-10">
                                High engagement ({interactionRatio.toFixed(1)}% above average)
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {tweet.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {tweet.hashtags.map((tag) => (
                        <span key={tag} className="flex items-center px-2 py-1 bg-gray-700 rounded-full text-xs">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <p className="mb-2 text-lg">{tweet.content}</p>

            {tweet.photos && tweet.photos.length > 0 && (
                <div
                    className={`grid gap-2 mb-3 ${
                        tweet.photos.length === 1
                            ? 'grid-cols-1'
                            : tweet.photos.length === 2
                                ? 'grid-cols-2'
                                : 'grid-cols-2 md:grid-cols-3'
                    }`}
                >
                    {tweet.photos.map((photo, idx) => (
                        <div
                            key={idx}
                            className="relative w-full rounded-lg overflow-hidden bg-gray-700 aspect-[4/3]"
                        >
                            <img
                                src={photo}
                                alt={`Tweet photo ${idx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {tweet.videos && tweet.videos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {tweet.videos.map((video, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden bg-gray-700 p-1">
                            <video
                                src={video}
                                controls
                                className="max-w-full max-h-[60vh] object-contain rounded"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-4">
                <div className="flex flex-col space-y-2 text-gray-300">
                    <div className="flex space-x-2 text-xs text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span>{tweet.language || 'Unknown'}</span>
                    </div>

                    <div className="flex space-x-4 text-sm">
                        <div className="relative flex items-center group">
                            <Heart className="w-4 h-4 mr-1 text-pink-400 hover:scale-110 transition-transform duration-200" />
                            {tweet.likesCount}
                            <span className="absolute bottom-full mb-1 w-max px-2 py-1 rounded bg-gray-700 text-xs opacity-0 group-hover:opacity-100 transition">
                              Likes
                            </span>
                        </div>
                        <div className="relative flex items-center group">
                            <Repeat className="w-4 h-4 mr-1 text-green-400 hover:scale-110 transition-transform duration-200" />
                            {tweet.retweetsCount}
                                <span className="absolute bottom-full mb-1 w-max px-2 py-1 rounded bg-gray-700 text-xs opacity-0 group-hover:opacity-100 transition">
                                  Retweets
                                </span>
                        </div>
                        <div className="relative flex items-center group">
                            <MessageCircle className="w-4 h-4 mr-1 text-blue-400 hover:scale-110 transition-transform duration-200" />
                            {tweet.repliesCount}
                            <span className="absolute bottom-full mb-1 w-max px-2 py-1 rounded bg-gray-700 text-xs opacity-0 group-hover:opacity-100 transition">
                              Replies
                            </span>
                        </div>
                    </div>
                </div>

                <a
                    href={tweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                >
                    View on Twitter
                </a>
            </div>

        </div>
    );
};

export default TweetCard;
