export interface Tweet {
    id: string;
    authorName: string;
    publicationDate: string;
    objectType: string;
    language: string | null;
    contentPreview: string;
    content: string;
    twitterId: string;
    url: string;
    conversationId: string;
    photos: string[];
    videos: string[];
    repliesCount: number;
    retweetsCount: number;
    likesCount: number;
    hashtags: string[];
    engagement: number;
    isHighEngagement: boolean;
}

export interface TweetResponse {
    tweets: Tweet[];
    total: number;
    page: number;
    totalPages: number;
}

export interface TweetAnalysisContainerProps {
    userName: string | undefined;
}

export interface ViralTweet {
    userName: string;
    tweetUrl: string;
    preview: string;
    likes: number;
    retweets: number;
    replies: number;
    engagementScore: number;
}