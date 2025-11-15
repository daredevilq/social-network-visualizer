import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { GraphData } from '@/app/interface/GraphData';
import { GraphNode } from '@/types/GraphTypes';

export class GraphApiService {
  static async removeNodesFromWorkspace(nodes: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/membership?add=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        nodes.map((node) => ({
          id: node.id,
          nodeType: node.nodeType,
        }))
      ),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove nodes from workspace (${response.status})`);
    }
    return await response.json();
  }

  /**
   * AUTHOR ENDPOINTS
   */
  static async addAuthorsLatestTweets(authors: { id: string; nodeNumber?: number }[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/latest-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to add latest tweets for authors (${response.status})`);
    }
    return await response.json();
  }

  static async addAuthorsMostPopularTweets(authors: { id: string }[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/popular-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to add most popular tweets for authors (${response.status})`);
    }
    return await response.json();
  }

  static async addAuthorsFromCommunities(authors: { id: string }[], nodeNumber?: number): Promise<GraphData> {
    const queryParam = nodeNumber !== undefined ? `?nodeNumber=${nodeNumber}` : '';

    const response = await fetch(`${API_BASE_URL}/graph/menu/author/communities${queryParam}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to add community authors (${response.status})`);
    }
    return await response.json();
  }

  static async addHashtagsUsedByAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/used-hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hashtags used by authors (${response.status})`);
    }
    return await response.json();
  }

  static async addMentionedUsersByAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/mentioned-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch mentioned users by authors (${response.status})`);
    }
    return await response.json();
  }

  static async addAuthorsMentioningAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/mentioning-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors mentioning these authors (${response.status})`);
    }
    return await response.json();
  }

  static async addAuthorsMostRepliedToByAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/replied-to-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors most replied to (${response.status})`);
    }
    return await response.json();
  }

  static async addAuthorsMostReplyingToAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/replying-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors most replying to (${response.status})`);
    }
    return await response.json();
  }

  static async addTweetsRepliedToByAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/replied-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tweets replied to by authors (${response.status})`);
    }
    return await response.json();
  }

  static async addTweetsMentioningAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/mentioned-in-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tweets mentioning authors (${response.status})`);
    }
    return await response.json();
  }

  static async addCommonHashtagsUsedByAuthors(authors: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/author/common-hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authors),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch common hashtags (${response.status})`);
    }
    return await response.json();
  }

  /**
   * TWEET ENDPOINTS
   */
  static async addTweetAuthorsToWorkspace(tweets: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweets),
    });

    if (!response.ok) {
      throw new Error(`Failed to add tweet authors to workspace (${response.status})`);
    }
    return await response.json();
  }

  static async addTweetHashtagsToWorkspace(tweets: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweets),
    });

    if (!response.ok) {
      throw new Error(`Failed to add tweet hashtags to workspace (${response.status})`);
    }
    return await response.json();
  }

  static async addMentionedAuthorsToWorksapce(tweets: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/mentioned-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweets),
    });

    if (!response.ok) {
      throw new Error(`Failed to add mentioned authors to tweets (${response.status})`);
    }
    return await response.json();
  }

  static async addParentsTweetsToWorkspace(tweets: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/parent-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweets),
    });

    if (!response.ok) {
      throw new Error(`Failed to add parent tweets to workspace (${response.status})`);
    }
    return await response.json();
  }

  static async addChildrenTweetsToWorkspace(tweets: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/children-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweets),
    });

    if (!response.ok) {
      throw new Error(`Failed to add children tweets to workspace (${response.status})`);
    }
    return await response.json();
  }

  static async addTweetsCommonHashtagsToWorkspace(tweets: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/tweet/common-hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweets),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch common hashtags (${response.status})`);
    }
    return await response.json();
  }

  /**
   * HASHTAG ENDPOINTS
   */
  static async highlightUsersForHashtags(hashtags: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/hashtag/highlight-authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hashtags),
    });

    if (!response.ok) {
      throw new Error(`Failed to highlight users for hashtags (${response.status})`);
    }
    return await response.json();
  }

  static async addTopTweetsByHashtags(hashtags: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/hashtag/top-tweets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hashtags),
    });

    if (!response.ok) {
      throw new Error(`Failed to add top tweets by hashtags (${response.status})`);
    }
    return await response.json();
  }

  static async addRelatedHashtags(hashtags: GraphNode[]): Promise<GraphData> {
    const response = await fetch(`${API_BASE_URL}/graph/menu/hashtag/related-hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hashtags),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch related hashtags (${response.status})`);
    }
    return await response.json();
  }
}
