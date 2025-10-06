import { NodeObject, LinkObject } from 'force-graph';

export interface AuthorNode extends NodeObject {
    nodeType: NodeType.AUTHOR;
    degreeCentrality: number;
    pagerank: number;
    community: string;
}
export interface TweetNode extends NodeObject {
    nodeType: NodeType.TWEET;
}
export interface HashtagNode extends NodeObject {
    nodeType: NodeType.HASHTAG;
}

export enum NodeType {
    AUTHOR = 'AUTHOR',
    TWEET = 'TWEET',
    HASHTAG = 'HASHTAG'
}
export type GraphNode = AuthorNode | TweetNode | HashtagNode;

export interface PostedLink extends LinkObject {
    linkType: LinkType.POSTED;
}
export interface MentionsLink extends LinkObject {
    linkType: LinkType.MENTIONS;
}
export interface RepliedToLink extends LinkObject {
    linkType: LinkType.REPLIED_TO;
}
export interface RetweetLink extends LinkObject {
    linkType: LinkType.RETWEET;
}
export interface HasHashtagLink extends LinkObject {
    linkType: LinkType.HAS_HASHTAG;
}

export enum LinkType {
    POSTED = 'POSTED',
    MENTIONS = 'MENTIONS',
    REPLIED_TO = 'REPLIED_TO',
    RETWEET = 'RETWEET',
    HAS_HASHTAG = 'HAS_HASHTAG'
}
export type GraphLink = PostedLink | MentionsLink | RepliedToLink | RetweetLink | HasHashtagLink;


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