import { ViralTweet } from '@/types/tweetTypes';

export interface TopAuthor {
  username: string;
  count: number;
}

export interface HashtagDetailsDto {
  hashtag: string;
  topAuthors: TopAuthor[];
  topTweets: ViralTweet[];
}
