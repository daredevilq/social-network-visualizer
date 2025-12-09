import React, { FC } from 'react';
import { Tweet } from '@/types/tweetTypes';
import TweetCard from './TweetCard';

interface TweetListProps {
  tweets: Tweet[];
  hasMore: boolean;
  inViewRef: any;
}

const TweetList: FC<TweetListProps> = ({ tweets, hasMore, inViewRef }) => {
  return (
    <div className="flex flex-col gap-4 pb-10 overflow-y-auto scrollbar-dark flex-1 px-1 pt-2">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
      {hasMore && <div ref={inViewRef} className="h-1 w-full" />}
    </div>
  );
};

export default TweetList;
