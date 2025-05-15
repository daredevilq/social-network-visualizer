import React, { FC } from 'react';
import { Tweet } from '@/types/tweetTypes';
import TweetCard from './TweetCard';
import { ArrowUp } from 'lucide-react';

interface TweetListProps {
    tweets: Tweet[];
    hasMore: boolean;
    inViewRef: any;
    showScrollTop: boolean;
    scrollToTop: () => void;
    tweetsContainerRef: React.RefObject<HTMLDivElement | null>;
}

const TweetList: FC<TweetListProps> = ({ tweets, hasMore, inViewRef, showScrollTop, scrollToTop, tweetsContainerRef }) => {
    return (
        <div
            className="flex flex-col gap-4 pb-10 overflow-y-auto scrollbar-dark flex-1 px-1"
            ref={tweetsContainerRef}
        >
            {tweets.length === 0 ? (
                <p className="text-center">No tweets found.</p>
            ) : (
                tweets.map((tweet) => (
                    <TweetCard key={tweet.id} tweet={tweet} />
                ))
            )}

            {hasMore && (
                <div ref={inViewRef} className="h-1 w-full" />
            )}

            {showScrollTop && (
                <button
                    className="absolute top-12 right-12 bg-[#7140F4] hover:bg-[#5a33c1] text-white p-3 rounded-full shadow-lg transition"
                    onClick={scrollToTop}
                >
                    <ArrowUp size={32} />
                </button>
            )}
        </div>
    );
};

export default TweetList;
