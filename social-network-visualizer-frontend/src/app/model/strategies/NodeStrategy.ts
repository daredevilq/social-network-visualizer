import {AuthorNode, GraphNode, NodeType} from "@/types/GraphTypes";
import NodeColors from "@/app/model/NodeColors";

export interface INodeStrategy {
    getColor: (node: GraphNode) => string;

    getRadius(node: GraphNode): number;
}


class AuthorNodeStrategy implements INodeStrategy {
    getColor(): string {
        return NodeColors.getDefaultAuthorColor();
    }
    getRadius(node:GraphNode): number {
        const authorNode = node as AuthorNode;
        return authorNode.pagerank ? Math.pow(authorNode.pagerank, 0.5) * 3 + 15 : 6;
    }
}

class TweetNodeStrategy implements INodeStrategy {
    getColor(): string {
        return NodeColors.getDefaultTweetColor();
    }

    getRadius(): number {
        return 8;
    }
}


class HashtagNodeStrategy implements INodeStrategy {
    getColor(): string {
        return NodeColors.getDefaultHashtagColor();
    }

    getRadius(): number {
        return 6;
    }
}

class NodeStrategy {
    private  strategies: Map<NodeType, INodeStrategy>;

    constructor() {
        this.strategies = new Map([
            [NodeType.AUTHOR, new AuthorNodeStrategy()],
            [NodeType.TWEET, new TweetNodeStrategy()],
            [NodeType.HASHTAG, new HashtagNodeStrategy()]
        ])
    }

    getColor(node: GraphNode): string {
        const strategy = this.resolveStrategy(node);
        return strategy.getColor(node);
    }

    getRadius(node: GraphNode): number {
        const strategy= this.resolveStrategy(node);
        return strategy.getRadius(node);
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
