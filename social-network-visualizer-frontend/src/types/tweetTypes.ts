export interface Tweet {
    id: string;
    publicationDate: string;
    objectType: string;
    language: string | null;
    contentPreview: string;
    content: string;
    twitterId: string;
    url: string;
    conversationId: string;
    repliesCount: number;
    retweetsCount: number;
    likesCount: number;
    hashtags: string[];
    avgLikes: number;
    avgRetweets: number;
    avgReplies: number;
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
