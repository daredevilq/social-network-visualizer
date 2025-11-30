import { GraphLink, RelationType } from '@/types/GraphTypes';
import Colors from '../../utils/Colors';

const MEDIUM_THRESHOLD = 5;
const HIGH_THRESHOLD = 10;

const DEFAULT_LINK_WIDTH = 2;
const MEDIUM_LINK_WIDTH = 2.5;
const HIGH_LINK_WIDTH = 3;

export interface ILinkStrategy {
  getColor(link: GraphLink): string;
  getWidth(link: GraphLink): number;
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

  getWidth(link: GraphLink): number {
    if (link.weight >= HIGH_THRESHOLD) {
      return HIGH_LINK_WIDTH;
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return MEDIUM_LINK_WIDTH;
    }
    return DEFAULT_LINK_WIDTH;
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

  getWidth(link: GraphLink): number {
    if (link.weight >= HIGH_THRESHOLD) {
      return HIGH_LINK_WIDTH;
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return MEDIUM_LINK_WIDTH;
    }
    return DEFAULT_LINK_WIDTH;
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

  getWidth(link: GraphLink): number {
    if (link.weight >= HIGH_THRESHOLD) {
      return HIGH_LINK_WIDTH;
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return MEDIUM_LINK_WIDTH;
    }
    return DEFAULT_LINK_WIDTH;
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

  getWidth(link: GraphLink): number {
    if (link.weight >= HIGH_THRESHOLD) {
      return HIGH_LINK_WIDTH;
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return MEDIUM_LINK_WIDTH;
    }
    return DEFAULT_LINK_WIDTH;
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

  getWidth(link: GraphLink): number {
    if (link.weight >= HIGH_THRESHOLD) {
      return HIGH_LINK_WIDTH;
    }
    if (link.weight >= MEDIUM_THRESHOLD) {
      return MEDIUM_LINK_WIDTH;
    }
    return DEFAULT_LINK_WIDTH;
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

  getWidth(link: GraphLink): number {
    const strategy = this.resolveStrategy(link);
    return strategy.getWidth(link);
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
