import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { GraphData } from '@/app/interface/GraphData';
import { GraphNode } from '@/types/GraphTypes';

export class GraphApiService {
  static async removeNodeFromWorkspace(node: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/membership?add=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: node.id,
        nodeType: node.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove node from workspace: ${node.id} (${response.status})`);
    }

    return await response.json();
  }

  /**
   * AUTHOR
   */
  static async addAuthorsLatestTweets(authorId: string): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/${authorId}/latest-tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to add top tweets for author: ${authorId} (${response.status})`);
    }

    return await response.json();
  }

  static async addTopAuthorsFromCommunity(communityId: string, numberOfAuthors: number): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/community`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        communityId: Number(communityId),
        numberOfAuthorsToAdd: numberOfAuthors,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add top 10 authors from community for author: ${communityId} (${response.status})`);
    }

    return await response.json();
  }

  /**
   * TWEET
   */
  static async addTweetAuthorToWorkspace(tweetNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/author`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: tweetNode.id,
        nodeType: tweetNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add tweet author to workspace: ${tweetNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addTweetHashtagsToWorkspace(tweetNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/hashtags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: tweetNode.id,
        nodeType: tweetNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add tweet hashtags to workspace: ${tweetNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addMentionedAuthorsToWorkspace(tweetNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/mentioned-authors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: tweetNode.id,
        nodeType: tweetNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add mentioned authors to workspace: ${tweetNode.id} (${response.status})`);
    }

    return await response.json();
  }

  /**
   * HASHTAG
   */

  static async highlightUsersForHashtag(hashtagNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/hashtag/highlight-authors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: hashtagNode.id,
        nodeType: hashtagNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to highlight authors for hashtag: ${hashtagNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addHashtagTopAuthors(hashtagNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/hashtag/top-tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: hashtagNode.id,
        nodeType: hashtagNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top authors for hashtag: ${hashtagNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addTopTweetsByHashtag(hashtagNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/hashtag/top-tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: hashtagNode.id,
        nodeType: hashtagNode.nodeType,
        ...(hashtagNode.nodeType === 'HASHTAG' && {
          frequency: hashtagNode.frequency,
          community: hashtagNode.community,
        }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add top tweets for hashtag: ${hashtagNode.id} (${response.status})`);
    }

    return await response.json();
  }
}
