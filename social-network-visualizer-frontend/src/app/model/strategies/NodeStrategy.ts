import { AuthorNode, GraphNode, HashtagNode, NodeType, TweetNode } from '@/types/GraphTypes';
import NodeColors from '@/app/model/NodeColors';
import { MenuItem } from '@/app/interface/Menu';
import { MenuItemsGetters } from '@/app/components/graphMenu/ContextMenuItemsProvider';

export interface INodeStrategy {
  getColor(node: GraphNode): string;

  getRadius(node: GraphNode): number;

  getLabel(node: GraphNode): string;

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (value: ((prevState: BasicUserData | null) => BasicUserData | null) | BasicUserData | null) => void,
    setIsSidebarOpen: (value: ((prevState: boolean) => boolean) | boolean) => void
  ): any;

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[];
}

class AuthorNodeStrategy implements INodeStrategy {
  getColor(): string {
    return NodeColors.getDefaultAuthorColor();
  }

  getRadius(node: GraphNode): number {
    const authorNode = node as AuthorNode;
    return authorNode.pagerank ? authorNode.pagerank * 10 + 15 : 15;
  }

  getLabel(node: GraphNode): string {
    return `${node.id}`;
  }

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (value: ((prevState: BasicUserData | null) => BasicUserData | null) | BasicUserData | null) => void,
    setIsSidebarOpen: (value: ((prevState: boolean) => boolean) | boolean) => void
  ) {
    setSelectedUserData({
      name: node.id,
      community: node.community,
    } as BasicUserData);
    setIsSidebarOpen((prev) => !prev);
  }

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[] {
    return menuItemsGetters.getAuthorMenuItems(node as AuthorNode);
  }
}

class TweetNodeStrategy implements INodeStrategy {
  getColor(): string {
    return NodeColors.getDefaultTweetColor();
  }

  getRadius(): number {
    return 10;
  }

  getLabel(node: GraphNode): string {
    const tweetNode = node as TweetNode;
    const maxLength = 15;

    return tweetNode.content.length > maxLength ? tweetNode.content.substring(0, maxLength) + '...' : tweetNode.content;
  }

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (value: ((prevState: BasicUserData | null) => BasicUserData | null) | BasicUserData | null) => void,
    setIsSidebarOpen: (value: ((prevState: boolean) => boolean) | boolean) => void
  ) {
    console.log('SingleNodeClick Method not implemented for: TWEET nodes.');
  }

  getContextMenuItems(node: GraphNode, menuItemsGetters: MenuItemsGetters): MenuItem[] {
    return menuItemsGetters.getTweetMenuItems(node as TweetNode);
  }
}

class HashtagNodeStrategy implements INodeStrategy {
  getColor(): string {
    return NodeColors.getDefaultHashtagColor();
  }

  getRadius(): number {
    return 7;
  }

  getLabel(node: GraphNode): string {
    return `${node.id}`;
  }

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (value: ((prevState: BasicUserData | null) => BasicUserData | null) | BasicUserData | null) => void,
    setIsSidebarOpen: (value: ((prevState: boolean) => boolean) | boolean) => void
  ) {
    console.log('SingleNodeClick Method not implemented for: Hashtag nodes.');
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

  getRadius(node: GraphNode): number {
    const strategy = this.resolveStrategy(node);
    return strategy.getRadius(node);
  }

  getLabel(node: GraphNode): string {
    const strategy = this.resolveStrategy(node);
    return strategy.getLabel(node);
  }

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (value: ((prevState: BasicUserData | null) => BasicUserData | null) | BasicUserData | null) => void,
    setIsSidebarOpen: (value: ((prevState: boolean) => boolean) | boolean) => void
  ) {
    const strategy = this.resolveStrategy(node);
    return strategy.handleNodeLeftClick(node, setSelectedUserData, setIsSidebarOpen);
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
