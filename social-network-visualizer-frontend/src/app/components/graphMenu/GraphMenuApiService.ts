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

  static async addAuthorsMostPopularTweets(authorId: string): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/${authorId}/popular-tweets`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top tweets for author: ${authorId}`);
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

  static async addHashtagsUsedByAuthor(authorNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/used-hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authorNode.id,
        nodeType: authorNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hashtags used by author: ${authorNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addMentionedUsersByAuthor(authorNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/mentioned-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authorNode.id,
        nodeType: authorNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch mentioned users for author: ${authorNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addAuthorsMentioningThisAuthor(authorNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/mentioning-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authorNode.id,
        nodeType: authorNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors mentioning this author: ${authorNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addAuthorsMostRepliedToByAuthor(authorNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/replied-to-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authorNode.id,
        nodeType: authorNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors most replied to by author: ${authorNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addAuthorsMostReplyingToAuthor(authorNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/replying-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authorNode.id,
        nodeType: authorNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors replying to author: ${authorNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addTweetsRepliedToByAuthor(authorNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/replied-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authorNode.id,
        nodeType: authorNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tweets replied to by author: ${authorNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addTweetsMentioningAuthor(authorNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/mentioned-in-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authorNode.id,
        nodeType: authorNode.nodeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tweets mentioning author: ${authorNode.id} (${response.status})`);
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

  static async addTweetParentToWorkspace(tweetNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/parent-tweet`, {
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
      throw new Error(`Failed to add tweet parent to workspace: ${tweetNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addChildrenToWorkspace(tweetNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/children-tweets`, {
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
      throw new Error(`Failed to add children to workspace: ${tweetNode.id} (${response.status})`);
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

  static async addTopTweetsByHashtag(hashtagNode: GraphNode): Promise<GraphData> {
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
      throw new Error(`Failed to add top tweets for hashtag: ${hashtagNode.id} (${response.status})`);
    }

    return await response.json();
  }

  static async addRelatedHashtags(hashtagNode: GraphNode): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/hashtag/related-hashtags`, {
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
      throw new Error(`Failed to fetch related hashtags for hashtag: ${hashtagNode.id} (${response.status})`);
    }

    return await response.json();
  }
}
