import { Heart, Repeat, MessageCircle, Globe, Info } from 'lucide-react';
import { Tweet } from "@/types/tweetTypes";

interface TweetCardProps {
    tweet: Tweet;
}

const TweetCard = ({ tweet }: TweetCardProps) => {
        const highlight = tweet.isHighEngagement;
        const interactionRatio = tweet.engagement;

    return (
        <div className={`border p-4 rounded-lg shadow ${highlight ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-700'}`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                    <span className="text-xs text-purple-400 font-semibold mb-1 uppercase tracking-wide">
                        Author:
                    </span>
                    <a
                        href={`/user-details/${tweet.authorName}`}
                        className="text-base font-bold text-white hover:underline hover:text-indigo-400 transition cursor-pointer"
                        aria-label={`Go to ${tweet.authorName} profile`}
                    >
                        {tweet.authorName}
                    </a>
                        <span className="text-xs text-gray-400 mt-1">
                    {new Date(tweet.publicationDate).toLocaleString()}
                    </span>
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

            <h2 className="font-bold text-lg mb-4">{tweet.contentPreview}</h2>
            <p className="mb-2">{tweet.content}</p>

            {tweet.photos && tweet.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {tweet.photos.map((photo, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden bg-gray-700 p-1">
                            <img
                                src={photo}
                                alt={`Tweet photo ${idx + 1}`}
                                className="max-w-full max-h-[60vh] object-contain rounded"
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

            <div className="flex space-x-4 text-sm text-gray-300 mb-2">
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

            <div className="flex space-x-2 text-xs text-gray-400 mb-2">
                <Globe className="w-4 h-4" />
                <span>{tweet.language || 'Unknown'}</span>
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

            <a
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-blue-400 hover:underline"
            >
                View on Twitter
            </a>
        </div>
    );
};

export default TweetCard;
