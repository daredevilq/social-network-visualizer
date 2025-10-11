import {GraphLink, RelationType} from "@/types/GraphTypes";
import NodeColors from "../NodeColors";

export interface ILinkStrategy {
    getColor(link: GraphLink): string;
}

class MentionsStrategy implements ILinkStrategy {
    getColor(link: GraphLink): string {
        return NodeColors.getMentionsColor();
    }
}

class RetweetsStrategy implements ILinkStrategy {
    getColor(link: GraphLink): string {
        return NodeColors.getRetweetsColor();
    }
}

class RepliesStrategy implements ILinkStrategy {
    getColor(link: GraphLink): string {
        return NodeColors.getRepliesColor();
    }
}

class QuotedStrategy implements ILinkStrategy {
    getColor(link: GraphLink): string {
        return NodeColors.getQuotedColor();
    }
}

class SharesHashtagStrategy implements ILinkStrategy {
    getColor(link: GraphLink): string {
        return NodeColors.getSharesHashtagColor();
    }
}

class PostedStrategy implements ILinkStrategy {
    getColor(link: GraphLink): string {
        return NodeColors.getPostedColor();
    }
}

class LinkStrategy implements ILinkStrategy {
    private strategies: Map<RelationType, ILinkStrategy>;

    constructor() {
        this.strategies = new Map([
            [RelationType.MENTIONS, new MentionsStrategy()],
            [RelationType.RETWEETS, new RetweetsStrategy()],
            [RelationType.REPLIES, new RepliesStrategy()],
            [RelationType.QUOTED, new QuotedStrategy()],
            [RelationType.SHARES_HASHTAG, new SharesHashtagStrategy()],
            [RelationType.HAS_HASHTAG, new PostedStrategy()],
            [RelationType.POSTED, new PostedStrategy()],
            [RelationType.HAS_REPLY, new RepliesStrategy()],
            [RelationType.USES_HASHTAG, new SharesHashtagStrategy()],
            [RelationType.RETWEETED, new RetweetsStrategy()],
            [RelationType.HAS_PARENT, new RepliesStrategy()],
            [RelationType.MENTION, new MentionsStrategy()],
            [RelationType.REPLY_TO, new RepliesStrategy()]
        ]);
    }

    getColor(link: GraphLink): string {
        const strategy = this.resolveStrategy(link);
        return strategy.getColor(link);
    }

    private resolveStrategy(link: GraphLink) {
        const strategy = this.strategies.get(link.relation);

        if (!strategy) {
            console.warn(`No strategy found for link type: ${link.relation}`);
            throw new Error(`No strategy found for link type: ${link.relation}`);
        }
        return strategy;
    }
}

const linkStrategy = new LinkStrategy();
export default linkStrategy;