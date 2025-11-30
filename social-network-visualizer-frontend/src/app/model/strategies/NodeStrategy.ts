import { AuthorNode, GraphNode, HashtagNode, NodeType, TweetNode } from '@/types/GraphTypes';
import Colors from '@/app/utils/Colors';
import { MenuItem } from '@/app/interface/Menu';
import { MenuItemsGetters } from '@/app/components/graphMenu/ContextMenuItemsProvider';

export interface INodeStrategy {
  getColor(node: GraphNode): string;

  getCommunityColor(node: GraphNode): string;

  getRadius(node: GraphNode): number;

  getLabel(node: GraphNode): string;

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[];
}

class AuthorNodeStrategy implements INodeStrategy {
  private static readonly SATURATION = 70;
  private static readonly LIGHTNESS = 50;

  getColor(): string {
    return Colors.DefaultAuthorColor();
  }

  getCommunityColor(node: GraphNode): string {
    const communityIndex = parseInt(node.community || '0', 10) || 0;

    if (communityIndex === 0 && !node.community) {
      return Colors.DefaultAuthorColor();
    }
    const hue = (communityIndex * 37) % 360;
    return `hsl(${hue}, ${AuthorNodeStrategy.SATURATION}%, ${AuthorNodeStrategy.LIGHTNESS}%)`;
  }

  getRadius(node: GraphNode): number {
    const authorNode = node as AuthorNode;
    return authorNode.pagerank ? authorNode.pagerank * 10 + 15 : 15;
  }

  getLabel(node: GraphNode): string {
    return `${node.name}`;
  }

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[] {
    return menuItemsGetters.getAuthorMenuItems(node as AuthorNode);
  }
}

class TweetNodeStrategy implements INodeStrategy {
  getColor(): string {
    return Colors.DefaultTweetColor();
  }

  getCommunityColor(): string {
    return Colors.DefaultTweetColor();
  }

  getRadius(): number {
    return 10;
  }

  getLabel(node: GraphNode): string {
    const tweetNode = node as TweetNode;
    const maxLength = 15;

    return tweetNode.content.length > maxLength ? tweetNode.content.substring(0, maxLength) + '...' : tweetNode.content;
  }

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[] {
    return menuItemsGetters.getTweetMenuItems(node as TweetNode);
  }
}

class HashtagNodeStrategy implements INodeStrategy {
  getColor(): string {
    return Colors.DefaultHashtagColor();
  }

  getCommunityColor(): string {
    return Colors.DefaultHashtagColor();
  }

  getRadius(): number {
    return 7;
  }

  getLabel(node: GraphNode): string {
    return `${node.name}`;
  }

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[] {
    return menuItemsGetters.getHashtagMenuItems(node as HashtagNode);
  }
}

class NodeStrategy {
  private strategies: Map<NodeType, INodeStrategy>;

  constructor() {
    this.strategies = new Map([
      [NodeType.AUTHOR, new AuthorNodeStrategy()],
      [NodeType.TWEET, new TweetNodeStrategy()],
      [NodeType.HASHTAG, new HashtagNodeStrategy()],
    ]);
  }

  getColor(node: GraphNode): string {
    const strategy = this.resolveStrategy(node);
    return strategy.getColor(node);
  }

  getCommunityColor(node: GraphNode): string {
    const strategy = this.resolveStrategy(node);
    return strategy.getCommunityColor(node);
  }

  getRadius(node: GraphNode): number {
    const strategy = this.resolveStrategy(node);
    return strategy.getRadius(node);
  }

  getLabel(node: GraphNode): string {
    const strategy = this.resolveStrategy(node);
    return strategy.getLabel(node);
  }

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[] {
    const strategy = this.resolveStrategy(node);
    return strategy.getContextMenuItems(node, menuItemsGetters);
  }

  private resolveStrategy(node: GraphNode) {
    const strategy = this.strategies.get(node.nodeType);

    if (!strategy) {
      console.warn(`No strategy found for node type: ${node.nodeType}`);
      throw new Error(`No strategy found for node type: ${node.nodeType}`);
    }
    return strategy;
  }
}

const nodeStrategy = new NodeStrategy();
export default nodeStrategy;
