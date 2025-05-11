import {ActivityPoint} from "@/app/interface/ActivityPoint";

export interface CommunitySummary{
    communityId: number;
    memberCount: number;
    topAuthor: string;
    topPageRank: number;
    topHashtags: string[];
    communityActivity: ActivityPoint[]
}