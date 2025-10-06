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


export function generateMockGraphData() {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const authors: AuthorNode[] = [
        {
            id: 'author_alice',
            nodeType: NodeType.AUTHOR,
            degreeCentrality: 15,
            pagerank: 0.045,
            community: 'tech'
        },
        {
            id: 'author_bob',
            nodeType: NodeType.AUTHOR,
            degreeCentrality: 22,
            pagerank: 0.067,
            community: 'tech'
        },
        {
            id: 'author_charlie',
            nodeType: NodeType.AUTHOR,
            degreeCentrality: 8,
            pagerank: 0.023,
            community: 'sports'
        },
        {
            id: 'author_diana',
            nodeType: NodeType.AUTHOR,
            degreeCentrality: 31,
            pagerank: 0.089,
            community: 'news'
        },
        {
            id: 'author_eve',
            nodeType: NodeType.AUTHOR,
            degreeCentrality: 12,
            pagerank: 0.034,
            community: 'entertainment'
        }
    ];

    // === TWEETY ===
    const tweets: TweetNode[] = [
        { id: 'tweet_001', nodeType: NodeType.TWEET },
        { id: 'tweet_002', nodeType: NodeType.TWEET },
        { id: 'tweet_003', nodeType: NodeType.TWEET },
        { id: 'tweet_004', nodeType: NodeType.TWEET },
        { id: 'tweet_005', nodeType: NodeType.TWEET },
        { id: 'tweet_006', nodeType: NodeType.TWEET },
        { id: 'tweet_007', nodeType: NodeType.TWEET },
        { id: 'tweet_008', nodeType: NodeType.TWEET }
    ];

    // === HASHTAGI ===
    const hashtags: HashtagNode[] = [
        { id: '#javascript', nodeType: NodeType.HASHTAG },
        { id: '#react', nodeType: NodeType.HASHTAG },
        { id: '#typescript', nodeType: NodeType.HASHTAG },
        { id: '#worldcup', nodeType: NodeType.HASHTAG },
        { id: '#breaking', nodeType: NodeType.HASHTAG },
        { id: '#movie', nodeType: NodeType.HASHTAG }
    ];

    nodes.push(...authors, ...tweets, ...hashtags);

    // === LINKI: AUTHOR -> TWEET (POSTED) ===
    const postedLinks: PostedLink[] = [
        { source: 'author_alice', target: 'tweet_001', linkType: LinkType.POSTED },
        { source: 'author_alice', target: 'tweet_002', linkType: LinkType.POSTED },
        { source: 'author_bob', target: 'tweet_003', linkType: LinkType.POSTED },
        { source: 'author_charlie', target: 'tweet_004', linkType: LinkType.POSTED },
        { source: 'author_diana', target: 'tweet_005', linkType: LinkType.POSTED },
        { source: 'author_diana', target: 'tweet_006', linkType: LinkType.POSTED },
        { source: 'author_eve', target: 'tweet_007', linkType: LinkType.POSTED },
        { source: 'author_bob', target: 'tweet_008', linkType: LinkType.POSTED }
    ];

    // === LINKI: TWEET -> HASHTAG (HAS_HASHTAG) ===
    const hashtagLinks: HasHashtagLink[] = [
        { source: 'tweet_001', target: '#javascript', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_001', target: '#react', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_002', target: '#typescript', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_003', target: '#react', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_003', target: '#javascript', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_004', target: '#worldcup', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_005', target: '#breaking', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_006', target: '#breaking', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_007', target: '#movie', linkType: LinkType.HAS_HASHTAG },
        { source: 'tweet_008', target: '#typescript', linkType: LinkType.HAS_HASHTAG }
    ];

    // === LINKI: TWEET -> AUTHOR (MENTIONS) ===
    const mentionLinks: MentionsLink[] = [
        { source: 'tweet_001', target: 'author_bob', linkType: LinkType.MENTIONS },
        { source: 'tweet_003', target: 'author_alice', linkType: LinkType.MENTIONS },
        { source: 'tweet_005', target: 'author_charlie', linkType: LinkType.MENTIONS },
        { source: 'tweet_007', target: 'author_diana', linkType: LinkType.MENTIONS }
    ];

    // === LINKI: TWEET -> TWEET (REPLIED_TO) ===
    const replyLinks: RepliedToLink[] = [
        { source: 'tweet_002', target: 'tweet_001', linkType: LinkType.REPLIED_TO },
        { source: 'tweet_006', target: 'tweet_005', linkType: LinkType.REPLIED_TO }
    ];

    // === LINKI: TWEET -> TWEET (RETWEET) ===
    const retweetLinks: RetweetLink[] = [
        { source: 'tweet_008', target: 'tweet_003', linkType: LinkType.RETWEET }
    ];

    links.push(
        ...postedLinks,
        ...hashtagLinks,
        ...mentionLinks,
        ...replyLinks,
        ...retweetLinks
    );

    return {
        nodes,
        links
    };
}
