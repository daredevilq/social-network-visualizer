import { MenuItem } from '@/app/interface/Menu';
import { AuthorNode, GraphLink, GraphNode, HashtagNode, TweetNode } from '@/types/GraphTypes';
import { ConnectionsIcon, HashtagIcon, HideIcon, ProfileIcon, TweetIcon } from '@/app/components/graphMenu/MenuIcons';
import { BannerType } from '@/app/components/Popups/Banner';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { useNotification } from '@/app/context/NotificationProvider';
import { GraphApiService } from '@/app/components/graphMenu/GraphMenuApiService';
import { GraphData } from '@/app/interface/GraphData';

export interface MenuItemsGetters {
  getAuthorMenuItems: (node: AuthorNode) => MenuItem[];
  getTweetMenuItems: (node: TweetNode) => MenuItem[];
  getHashtagMenuItems: (node: HashtagNode) => MenuItem[];
}

export const useContextMenuItems = (): MenuItemsGetters => {
  const { workspaceData, setWorkspaceData, setHasUnsavedChanges } = useWorkspace();
  const { showNotification } = useNotification();

  const getCommonMenuItems = (node: GraphNode): MenuItem[] => {
    return [
      {
        label: 'Remove from workspace',
        icon: <HideIcon />,
        onMenuItemClick: () => removeNodeFromWorkspace(node),
        isSeparator: true,
      },
    ];
  };

  const getAuthorMenuItems = (node: AuthorNode): MenuItem[] => {
    const authorItems: MenuItem[] = [
      {
        label: 'Add author tweets',
        icon: <ConnectionsIcon />,
        submenu: [
          {
            label: 'Add latest 10 tweets',
            icon: <TweetIcon />,
            onMenuItemClick: async () => addLatestTweets(node.id),
          },
          {
            label: 'Add 10 most popular tweets',
            icon: <TweetIcon />,
            onMenuItemClick: () => addMostPopularTweets(node.id),
          },
        ],
      },
      {
        label: 'Add authors from community',
        icon: <ConnectionsIcon />,
        submenu: [
          {
            label: 'Add 10 authors from community',
            icon: <ConnectionsIcon />,
            onMenuItemClick: () => addAuthorCommunityToWorkspace(node.community, 10),
          },
          {
            label: 'Add entire community',
            icon: <ConnectionsIcon />,
            onMenuItemClick: () => addAuthorCommunityToWorkspace(node.community, -1),
          },
        ],
      },
      {
        label: 'Show frequently mentioned users',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addMentionedUsersByAuthor(node),
      },
      {
        label: 'Show users mentioning this author',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addAuthorsMentioningThisAuthor(node),
      },
      {
        label: 'Show users this author often replies to',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addAuthorsMostRepliedToByAuthor(node),
      },
      {
        label: 'Show users often replying to this author',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addAuthorsMostReplyingToAuthor(node),
      },
      {
        label: 'Show last tweets replied to',
        icon: <TweetIcon />,
        onMenuItemClick: async () => addTweetsRepliedToByAuthor(node),
      },
      {
        label: 'Show tweets mentioning this author',
        icon: <TweetIcon />,
        onMenuItemClick: async () => addTweetsMentioningAuthor(node),
      },
      {
        label: 'Show hashtags used',
        icon: <HashtagIcon />,
        onMenuItemClick: async () => addHashtagsUsedByAuthor(node),
      },
    ];

    return [...authorItems, ...getCommonMenuItems(node)];
  };

  const getTweetMenuItems = (node: GraphNode): MenuItem[] => {
    const tweetItems: MenuItem[] = [
      {
        label: 'Show author',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addTweetAuthorToWorkspace(node),
      },
      {
        label: 'Show mentioned users',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addMentionedAuthorsToWorkspace(node),
      },
      {
        label: 'Show tweet parent',
        icon: <TweetIcon />,
        onMenuItemClick: async () => addTweetParentToWorkspace(node),
      },
      {
        label: 'Show tweet children',
        icon: <TweetIcon />,
        onMenuItemClick: async () => addChildrenToWorkspace(node),
      },
      {
        label: 'Show hashtags used',
        icon: <HashtagIcon />,
        onMenuItemClick: async () => addTweetHashtagsToWorkspace(node),
      },
    ];

    return [...tweetItems, ...getCommonMenuItems(node)];
  };

  const getHashtagMenuItems = (node: GraphNode): MenuItem[] => {
    const hashtagItems: MenuItem[] = [
      {
        label: 'Show 10 authors by usage',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => highlightUsersForHashtag(node),
      },
      {
        label: 'Show top 10 most popular tweets',
        icon: <TweetIcon />,
        onMenuItemClick: async () => addTopTweetsByHashtag(node),
      },
      {
        label: 'Show related hashtags',
        icon: <HashtagIcon />,
        onMenuItemClick: async () => addRelatedHashtags(node),
      },
    ];

    return [...hashtagItems, ...getCommonMenuItems(node)];
  };

  async function handleGraphUpdate<T>(action: () => Promise<GraphData>, successMessage: string, errorMessage: string) {
    try {
      const data = await action();
      setHasUnsavedChanges(!areGraphDataEqual(data, workspaceData));
      setWorkspaceData({
        nodes: data.nodes,
        links: data.links,
      });

      showNotification(successMessage, BannerType.SUCCESS);
    } catch (_err) {
      showNotification(errorMessage, BannerType.ERROR);
    }
  }

  const addLatestTweets = async (authorId: string) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsLatestTweets(authorId),
      `Loaded top 10 tweets for "${authorId}"`,
      `Failed to load tweets for "${authorId}"`
    );
  };

  const addMostPopularTweets = async (authorId: string) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMostPopularTweets(authorId),
      `Loaded top 10 most popular tweets for "${authorId}"`,
      `Failed to load top tweets for "${authorId}"`
    );
  };

  const removeNodeFromWorkspace = async (node: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.removeNodeFromWorkspace(node),
      `Node "${node.id}" removed`,
      `Failed to remove node "${node.id}"`
    );
  };

  const addTweetAuthorToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetAuthorToWorkspace(tweetNode),
      `Added author of tweet "${tweetNode.id}"`,
      `Failed to add author of tweet "${tweetNode.id}"`
    );
  };

  const addTweetHashtagsToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetHashtagsToWorkspace(tweetNode),
      `Added hashtags from tweet "${tweetNode.id}"`,
      `Failed to add hashtags from tweet "${tweetNode.id}"`
    );
  };

  const addMentionedAuthorsToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addMentionedAuthorsToWorkspace(tweetNode),
      `Added mentioned authors from tweet  "${tweetNode.id}"`,
      `Failed to add mentioned authors from tweet "${tweetNode.id}"`
    );
  };

  const addTweetParentToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetParentToWorkspace(tweetNode),
      `Added parent tweet for  "${tweetNode.id}"`,
      `No parent found for "${tweetNode.id}"`
    );
  };

  const addChildrenToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addChildrenToWorkspace(tweetNode),
      `Added children tweets from tweet  "${tweetNode.id}"`,
      `Failed to add children tweets from tweet "${tweetNode.id}"`
    );
  };

  const highlightUsersForHashtag = async (hashtagNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.highlightUsersForHashtag(hashtagNode),
      `Highlighted top 10 users for hashtag"${hashtagNode.id}"`,
      `Failed to highlight top users for hashtag "${hashtagNode.id}"`
    );
  };

  const addTopTweetsByHashtag = async (hashtagNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTopTweetsByHashtag(hashtagNode),
      `Added top 5 tweets for hashtag "${hashtagNode.id}"`,
      `Failed to add top tweets for hashtag "${hashtagNode.id}"`
    );
  };

  const addRelatedHashtags = async (hashtagNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addRelatedHashtags(hashtagNode),
      `Added related hashtags for hashtag "${hashtagNode.id}"`,
      `Failed to add related hashtags for hashtag "${hashtagNode.id}"`
    );
  };

  const addAuthorCommunityToWorkspace = async (communityId: string, numberOfAuthors: number) => {
    await handleGraphUpdate(
      () => GraphApiService.addTopAuthorsFromCommunity(communityId, numberOfAuthors),
      numberOfAuthors === -1
        ? `Entire community "${communityId}" added`
        : `Top ${numberOfAuthors} authors from community "${communityId}" added`,
      `Failed to add authors from community "${communityId}"`
    );
  };

  const addHashtagsUsedByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addHashtagsUsedByAuthor(authorNode),
      `Added hashtags used by "${authorNode.id}"`,
      `Failed to load hashtags used by "${authorNode.id}"`
    );
  };

  const addMentionedUsersByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addMentionedUsersByAuthor(authorNode),
      `Added users mentioned by "${authorNode.id}"`,
      `Failed to load mentioned users for "${authorNode.id}"`
    );
  };

  const addAuthorsMentioningThisAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMentioningThisAuthor(authorNode),
      `Added users mentioning "${authorNode.id}"`,
      `Failed to load users mentioning "${authorNode.id}"`
    );
  };

  const addAuthorsMostRepliedToByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMostRepliedToByAuthor(authorNode),
      `Added users "${authorNode.id}" replies to most often`,
      `Failed to load users "${authorNode.id}" replies to`
    );
  };

  const addAuthorsMostReplyingToAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMostReplyingToAuthor(authorNode),
      `Added users replying to "${authorNode.id}" most often`,
      `Failed to load users replying to "${authorNode.id}"`
    );
  };

  const addTweetsRepliedToByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetsRepliedToByAuthor(authorNode),
      `Added tweets replied to by "${authorNode.id}"`,
      `Failed to load replies for "${authorNode.id}"`
    );
  };

  const addTweetsMentioningAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetsMentioningAuthor(authorNode),
      `Added tweets mentioning "${authorNode.id}"`,
      `Failed to load tweets mentioning "${authorNode.id}"`
    );
  };

  const areGraphDataEqual = (currentData: GraphData, newData: GraphData): boolean => {
    if (currentData.nodes.length !== newData.nodes.length || currentData.links.length !== newData.links.length) {
      return false;
    }

    const currentNodeIds = new Set(currentData.nodes.map((node) => node.id));
    const newNodeIds = new Set(newData.nodes.map((node) => node.id));

    if (currentNodeIds.size !== newNodeIds.size) {
      return false;
    }

    for (const id of newNodeIds) {
      if (!currentNodeIds.has(id)) {
        return false;
      }
    }

    const currentLinks = new Set(currentData.links.map((link: GraphLink) => `${link.source}-${link.target}`));
    const newLinks = new Set(newData.links.map((link: GraphLink) => `${link.source}-${link.target}`));

    if (currentLinks.size !== newLinks.size) {
      return false;
    }

    for (const linkKey of newLinks) {
      if (!currentLinks.has(linkKey)) {
        return false;
      }
    }

    return true;
  };

  return {
    getAuthorMenuItems,
    getTweetMenuItems,
    getHashtagMenuItems,
  };
};
