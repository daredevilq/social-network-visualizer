import { MenuItem } from '@/app/interface/Menu';
import { AuthorNode, GraphNode, HashtagNode, TweetNode } from '@/types/GraphTypes';
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
        label: 'Show author tweets',
        icon: <ConnectionsIcon />,
        submenu: [
          {
            label: 'Latest 10 tweets',
            icon: <TweetIcon />,
            onMenuItemClick: async () => addLatestTweets(node),
          },
          {
            label: '10 most popular tweets',
            icon: <TweetIcon />,
            onMenuItemClick: () => addMostPopularTweets(node),
          },
          {
            label: 'Tweets replied to',
            icon: <TweetIcon />,
            onMenuItemClick: async () => addTweetsRepliedToByAuthor(node),
          },
          {
            label: 'Tweets mentioning author',
            icon: <TweetIcon />,
            onMenuItemClick: async () => addTweetsMentioningAuthor(node),
          },
        ],
      },
      {
        label: 'Show authors from community',
        icon: <ConnectionsIcon />,
        submenu: [
          {
            label: '10 authors from communities',
            icon: <ConnectionsIcon />,
            onMenuItemClick: () => addAuthorCommunityToWorkspace(node, 10),
          },
          {
            label: 'Entire community',
            icon: <ConnectionsIcon />,
            onMenuItemClick: () => addAuthorCommunityToWorkspace(node),
          },
        ],
      },
      {
        label: 'Show frequently mentioned users',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addMentionedUsersByAuthor(node),
      },
      {
        label: 'Show users mentioning author',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addAuthorsMentioningThisAuthor(node),
      },
      {
        label: 'Show users author replies to',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addAuthorsMostRepliedToByAuthor(node),
      },
      {
        label: 'Show users replying to author',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addAuthorsMostReplyingToAuthor(node),
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
        label: 'Show parent tweet',
        icon: <TweetIcon />,
        onMenuItemClick: async () => addTweetParentToWorkspace(node),
      },
      {
        label: 'Show child tweets',
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
        label: 'Show top authors by usage',
        icon: <ProfileIcon />,
        onMenuItemClick: async () => highlightUsersForHashtag(node),
      },
      {
        label: 'Show top 10 tweets',
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

      if (areGraphDataEqual(data, workspaceData)) {
        showNotification('No changes detected in the graph.', BannerType.INFO);
        return;
      }

      setHasUnsavedChanges(true);
      setWorkspaceData({
        nodes: data.nodes,
        links: data.links,
      });

      showNotification(successMessage, BannerType.SUCCESS);
    } catch (_err) {
      showNotification(errorMessage, BannerType.ERROR);
    }
  }

  const shortenId = (id: string, length = 15) => {
    if (!id) return '';
    return id.length > length ? `${id.slice(0, length)}...` : id;
  };

  const addLatestTweets = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsLatestTweets([authorNode]),
      `Loaded top 10 tweets for "${shortenId(authorNode.name)}"`,
      `Failed to load tweets for "${shortenId(authorNode.name)}"`
    );
  };

  const addMostPopularTweets = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMostPopularTweets([authorNode]),
      `Loaded top 10 most popular tweets for "${shortenId(authorNode.name)}"`,
      `Failed to load top tweets for "${shortenId(authorNode.name)}"`
    );
  };

  const removeNodeFromWorkspace = async (node: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.removeNodesFromWorkspace([node]),
      `Node "${shortenId(node.name)}" removed`,
      `Failed to remove node "${shortenId(node.name)}"`
    );
  };

  const addTweetAuthorToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetAuthorsToWorkspace([tweetNode]),
      `Added author of tweet "${shortenId(tweetNode.name)}"`,
      `Failed to add author of tweet "${shortenId(tweetNode.name)}"`
    );
  };

  const addTweetHashtagsToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetHashtagsToWorkspace([tweetNode]),
      `Added hashtags from tweet "${shortenId(tweetNode.name)}"`,
      `Failed to add hashtags from tweet "${shortenId(tweetNode.name)}"`
    );
  };

  const addMentionedAuthorsToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addMentionedAuthorsToWorksapce([tweetNode]),
      `Added mentioned authors from tweet "${shortenId(tweetNode.name)}"`,
      `Failed to add mentioned authors from tweet "${shortenId(tweetNode.name)}"`
    );
  };

  const addTweetParentToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addParentsTweetsToWorkspace([tweetNode]),
      `Added parent tweet for "${shortenId(tweetNode.name)}"`,
      `No parent found for "${shortenId(tweetNode.name)}"`
    );
  };

  const addChildrenToWorkspace = async (tweetNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addChildrenTweetsToWorkspace([tweetNode]),
      `Added children tweets for "${shortenId(tweetNode.name)}"`,
      `Failed to add children tweets for "${shortenId(tweetNode.name)}"`
    );
  };

  const highlightUsersForHashtag = async (hashtagNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.highlightUsersForHashtags([hashtagNode]),
      `Highlighted top 10 users for hashtag "${shortenId(hashtagNode.name)}"`,
      `Failed to highlight top users for hashtag "${shortenId(hashtagNode.name)}"`
    );
  };

  const addTopTweetsByHashtag = async (hashtagNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTopTweetsByHashtags([hashtagNode]),
      `Added top 5 tweets for hashtag "${shortenId(hashtagNode.name)}"`,
      `Failed to add top tweets for hashtag "${shortenId(hashtagNode.name)}"`
    );
  };

  const addRelatedHashtags = async (hashtagNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addRelatedHashtags([hashtagNode]),
      `Added related hashtags for "${shortenId(hashtagNode.name)}"`,
      `Failed to add related hashtags for "${shortenId(hashtagNode.name)}"`
    );
  };

  const addAuthorCommunityToWorkspace = async (authorNode: AuthorNode, numberOfAuthors?: number) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsFromCommunities([authorNode], numberOfAuthors),
      numberOfAuthors
        ? `Top ${numberOfAuthors} authors from community of "${shortenId(authorNode.name)}" added`
        : `Entire community for "${shortenId(authorNode.name)}" added`,
      `Failed to add authors from community of "${shortenId(authorNode.name)}"`
    );
  };

  const addHashtagsUsedByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addHashtagsUsedByAuthors([authorNode]),
      `Added hashtags used by "${shortenId(authorNode.name)}"`,
      `Failed to load hashtags used by "${shortenId(authorNode.name)}"`
    );
  };

  const addMentionedUsersByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addMentionedUsersByAuthors([authorNode]),
      `Added users mentioned by "${shortenId(authorNode.name)}"`,
      `Failed to load mentioned users for "${shortenId(authorNode.name)}"`
    );
  };

  const addAuthorsMentioningThisAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMentioningAuthors([authorNode]),
      `Added users mentioning "${shortenId(authorNode.name)}"`,
      `Failed to load users mentioning "${shortenId(authorNode.name)}"`
    );
  };

  const addAuthorsMostRepliedToByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMostRepliedToByAuthors([authorNode]),
      `Added users "${shortenId(authorNode.name)}" replies to most often`,
      `Failed to load users "${shortenId(authorNode.name)}" replies to`
    );
  };

  const addAuthorsMostReplyingToAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addAuthorsMostReplyingToAuthors([authorNode]),
      `Added users replying to "${shortenId(authorNode.name)}" most often`,
      `Failed to load users replying to "${shortenId(authorNode.name)}"`
    );
  };

  const addTweetsRepliedToByAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetsRepliedToByAuthors([authorNode]),
      `Added tweets replied to by "${shortenId(authorNode.name)}"`,
      `Failed to load replies for "${shortenId(authorNode.name)}"`
    );
  };

  const addTweetsMentioningAuthor = async (authorNode: GraphNode) => {
    await handleGraphUpdate(
      () => GraphApiService.addTweetsMentioningAuthors([authorNode]),
      `Added tweets mentioning "${shortenId(authorNode.name)}"`,
      `Failed to load tweets mentioning "${shortenId(authorNode.name)}"`
    );
  };

  const areGraphDataEqual = (currentData: GraphData, newData: GraphData): boolean => {
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

    return true;
  };

  return {
    getAuthorMenuItems,
    getTweetMenuItems,
    getHashtagMenuItems,
  };
};
