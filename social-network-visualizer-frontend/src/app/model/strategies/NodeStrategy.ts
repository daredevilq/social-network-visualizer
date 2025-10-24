import { AuthorNode, GraphNode, NodeType } from "@/types/GraphTypes";
import NodeColors from "@/app/model/NodeColors";

export interface INodeStrategy {
  getColor(node: GraphNode): string;

  getRadius(node: GraphNode): number;

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (
      value:
        | ((prevState: BasicUserData | null) => BasicUserData | null)
        | BasicUserData
        | null,
    ) => void,
    setIsSidebarOpen: (
      value: ((prevState: boolean) => boolean) | boolean,
    ) => void,
  ): any;

  handleNodeRightClick(node: GraphNode): any;
}

class AuthorNodeStrategy implements INodeStrategy {
  getColor(): string {
    return NodeColors.getDefaultAuthorColor();
  }

  getRadius(node: GraphNode): number {
    const authorNode = node as AuthorNode;
    return authorNode.pagerank ? authorNode.pagerank * 10 + 15 : 15;
  }

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (
      value:
        | ((prevState: BasicUserData | null) => BasicUserData | null)
        | BasicUserData
        | null,
    ) => void,
    setIsSidebarOpen: (
      value: ((prevState: boolean) => boolean) | boolean,
    ) => void,
  ) {
    setSelectedUserData({
      name: node.id,
      community: node.community,
    } as BasicUserData);
    setIsSidebarOpen((prev) => !prev);
  }

  handleNodeRightClick(node: GraphNode) {
    console.log("Right click on AUTHOR node:", node.id);
  }
}

class TweetNodeStrategy implements INodeStrategy {
  getColor(): string {
    return NodeColors.getDefaultTweetColor();
  }

  getRadius(): number {
    return 10;
  }

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (
      value:
        | ((prevState: BasicUserData | null) => BasicUserData | null)
        | BasicUserData
        | null,
    ) => void,
    setIsSidebarOpen: (
      value: ((prevState: boolean) => boolean) | boolean,
    ) => void,
  ) {
    console.log("SingleNodeClick Method not implemented for: TWEET nodes.");
  }

  handleNodeRightClick(node: GraphNode) {
    console.log("Right click on TWEET node:", node.id);
  }
}

class HashtagNodeStrategy implements INodeStrategy {
  getColor(): string {
    return NodeColors.getDefaultHashtagColor();
  }

  getRadius(): number {
    return 7;
  }

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (
      value:
        | ((prevState: BasicUserData | null) => BasicUserData | null)
        | BasicUserData
        | null,
    ) => void,
    setIsSidebarOpen: (
      value: ((prevState: boolean) => boolean) | boolean,
    ) => void,
  ) {
    console.log("SingleNodeClick Method not implemented for: Hashtag nodes.");
  }

  handleNodeRightClick(node: GraphNode) {
    console.log("Right click on HASHTAG node:", node.id);
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

  handleNodeLeftClick(
    node: GraphNode,
    setSelectedUserData: (
      value:
        | ((prevState: BasicUserData | null) => BasicUserData | null)
        | BasicUserData
        | null,
    ) => void,
    setIsSidebarOpen: (
      value: ((prevState: boolean) => boolean) | boolean,
    ) => void,
  ) {
    const strategy = this.resolveStrategy(node);
    return strategy.handleNodeLeftClick(
      node,
      setSelectedUserData,
      setIsSidebarOpen,
    );
  }

  handleNodeRightClick(node: GraphNode) {
    const strategy = this.resolveStrategy(node);
    return strategy.handleNodeRightClick(node);
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
