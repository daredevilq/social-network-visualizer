export interface SizeCount {
    communitySize: number;
    memberCount: number;
}

export interface CommunityOverview {
    avgHashtagsPerAuthor: number;
    totalTweets: number;
    totalCommunities: number;
    minSize: number;
    maxSize: number;
    avgSize: number;
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
    sizeHistogram: SizeCount[];
    avgTweetsPerAuthor: number;
    uniqueHashtags: number;
}
