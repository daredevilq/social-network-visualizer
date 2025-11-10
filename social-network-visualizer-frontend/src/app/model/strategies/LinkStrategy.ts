import { GraphLink, RelationType } from '@/types/GraphTypes';
import Colors from '../../utils/Colors';

const MEDIUM_THRESHOLD = 5;
const HIGH_THRESHOLD = 10;

export interface ILinkStrategy {
  getColor(link: GraphLink): string;
}

class AuthorAuthorStrategy implements ILinkStrategy {
  getColor(link: GraphLink): string {
    if (link.weight >= HIGH_THRESHOLD) {
      return Colors.AuthorAuthorLinkColorHigh();
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return Colors.AuthorAuthorLinkColorMedium();
    }
    return Colors.AuthorAuthorLinkColorLow();
  }
}

class TweetTweetStrategy implements ILinkStrategy {
  getColor(link: GraphLink): string {
    if (link.weight >= HIGH_THRESHOLD) {
      return Colors.TweetTweetLinkColorHigh();
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return Colors.TweetTweetLinkColorMedium();
    }
    return Colors.TweetTweetLinkColorLow();
  }
}

class AuthorTweetStrategy implements ILinkStrategy {
  getColor(link: GraphLink): string {
    if (link.weight >= HIGH_THRESHOLD) {
      return Colors.AuthorTweetLinkColorHigh();
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return Colors.AuthorTweetLinkColorMedium();
    }
    return Colors.AuthorTweetLinkColorLow();
  }
}

class TweetHashtagStrategy implements ILinkStrategy {
  getColor(link: GraphLink): string {
    if (link.weight >= HIGH_THRESHOLD) {
      return Colors.TweetHashtagLinkColorHigh();
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return Colors.TweetHashtagLinkColorMedium();
    }
    return Colors.TweetHashtagLinkColorLow();
  }
}

class AuthorHashtagStrategy implements ILinkStrategy {
  getColor(link: GraphLink): string {
    if (link.weight >= HIGH_THRESHOLD) {
      return Colors.AuthorHashtagLinkColorHigh();
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return Colors.AuthorHashtagLinkColorMedium();
    }
    return Colors.AuthorHashtagLinkColorLow();
  }
}

class LinkStrategy implements ILinkStrategy {
  private strategies: Map<RelationType, ILinkStrategy>;

  constructor() {
    this.strategies = new Map([
      [RelationType.MENTIONS, new AuthorAuthorStrategy()],
      [RelationType.RETWEETS, new AuthorAuthorStrategy()],
      [RelationType.REPLIES, new AuthorAuthorStrategy()],
      [RelationType.QUOTED, new TweetTweetStrategy()],
      [RelationType.SHARES_HASHTAG, new AuthorAuthorStrategy()],
      [RelationType.HAS_HASHTAG, new TweetHashtagStrategy()],
      [RelationType.POSTED, new AuthorTweetStrategy()],
      [RelationType.HAS_REPLY, new AuthorTweetStrategy()],
      [RelationType.USES_HASHTAG, new AuthorHashtagStrategy()],
      [RelationType.RETWEETED, new TweetTweetStrategy()],
      [RelationType.HAS_PARENT, new TweetTweetStrategy()],
      [RelationType.MENTION, new AuthorTweetStrategy()],
      [RelationType.REPLY_TO, new TweetTweetStrategy()],
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
