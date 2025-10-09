import { NodeObject, LinkObject } from 'force-graph';

export enum NodeType {
    AUTHOR = 'AUTHOR',
    TWEET = 'TWEET',
    HASHTAG = 'HASHTAG'
}

export interface BaseNode extends NodeObject {
    id: string;
    nodeType: NodeType;
}

export interface AuthorNode extends BaseNode {
    nodeType: NodeType.AUTHOR;
    community: string;
    pagerank: number;
    centrality: number;
}
export interface TweetNode extends BaseNode {
    nodeType: NodeType.TWEET;
    content: string;
    authorName: string;
    likesCount: number;
    retweetsCount: number;
    community: string;
}
export interface HashtagNode extends BaseNode {
    nodeType: NodeType.HASHTAG;
    frequency?: number;
    community?: string;
}

export type GraphNode = AuthorNode | TweetNode | HashtagNode;


export enum RelationType {
    MENTIONS = 'MENTIONS',
    RETWEETS = 'RETWEETS',
    REPLIES = 'REPLIES',
    QUOTED = 'QUOTED',
    SHARES_HASHTAG = 'SHARES_HASHTAG',
    HAS_HASHTAG = 'HAS_HASHTAG',
    HAS_REPLY = 'HAS_REPLY',
    USES_HASHTAG = 'USES_HASHTAG',
    RETWEETED = 'RETWEETED',
    HAS_PARENT = 'HAS_PARENT',
    MENTION = 'MENTION',
    REPLY_TO = 'REPLY_TO',
    POSTED = 'POSTED'
}

export interface GraphLink extends LinkObject {
    source: string,
    target: string,
    relation: RelationType;
}

export interface GraphProps {
    graphData: {
        nodes: GraphNode[];
        links: GraphLink[];
    };
    nodeVal: (node: GraphNode) => number;
    nodeLabel: (node: GraphNode) => string;
    nodeColor: (node: GraphNode) => string;
    linkColor: (link: GraphLink) => string;
    linkWidth: (link: GraphLink) => number;
    linkDirectionalArrowLength: number;
    linkDirectionalArrowRelPos: number;
    nodeFoundId: string | null;
}

export interface SelectionBox {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
