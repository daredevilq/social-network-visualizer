import { MenuItem } from '@/app/interface/Menu';
import { GraphLink, GraphNode, NodeType } from '@/types/GraphTypes';
import { ConnectionsIcon, HashtagIcon, HideIcon, ProfileIcon, TweetIcon } from '@/app/components/graphMenu/MenuIcons';
import { BannerType } from '@/app/components/Popups/Banner';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { useNotification } from '@/app/context/NotificationProvider';
import { GraphApiService } from '@/app/components/graphMenu/GraphMenuApiService';
import { GraphData } from '@/app/interface/GraphData';

export interface MenuItemsGetters {
  getMultiMenuItems: (nodes: GraphNode[]) => MenuItem[];
}

export const useContextMultiMenuItems = (): MenuItemsGetters => {
  const { workspaceData, setWorkspaceData, setHasUnsavedChanges } = useWorkspace();
  const { showNotification } = useNotification();

  const getMultiMenuItems = (nodes: GraphNode[]): MenuItem[] => {
    const authorNodes = nodes.filter((node) => node.nodeType === NodeType.AUTHOR);
    const tweetNodes = nodes.filter((node) => node.nodeType === NodeType.TWEET);
    const hashtagNodes = nodes.filter((node) => node.nodeType === NodeType.HASHTAG);

    return [
      {
        label: 'Authors',
        icon: <ProfileIcon />,
        submenu: [
          {
            label: 'Add authors’ tweets',
            icon: <ConnectionsIcon />,
            submenu: [
              {
                label: 'Latest 10 tweets',
                icon: <TweetIcon />,
                onMenuItemClick: () => addAuthorsLatestTweets(authorNodes),
              },
              {
                label: '10 most popular tweets',
                icon: <TweetIcon />,
                onMenuItemClick: () => addAuthorsMostPopularTweets(authorNodes),
              },
            ],
          },
          {
            label: 'Add authors from communities',
            icon: <ConnectionsIcon />,
            submenu: [
              {
                label: '10 authors from communities',
                icon: <ConnectionsIcon />,
                onMenuItemClick: () => addAuthorsFromCommunities(authorNodes, 10),
              },
              {
                label: 'Entire communities',
                icon: <ConnectionsIcon />,
                onMenuItemClick: () => addAuthorsFromCommunities(authorNodes),
              },
            ],
          },
          {
            label: 'Frequently mentioned users',
            icon: <ProfileIcon />,
            onMenuItemClick: () => addMentionedUsersByAuthors(authorNodes),
          },
          {
            label: 'Users mentioning authors',
            icon: <ProfileIcon />,
            onMenuItemClick: () => addUsersMentioningAuthors(authorNodes),
          },
          {
            label: 'Users authors reply to',
            icon: <ProfileIcon />,
            onMenuItemClick: () => addUsersAuthorsReplyTo(authorNodes),
          },
          {
            label: 'Users replying to authors',
            icon: <ProfileIcon />,
            onMenuItemClick: () => addUsersReplyingToAuthors(authorNodes),
          },
          {
            label: 'Tweets replied to',
            icon: <TweetIcon />,
            onMenuItemClick: () => addTweetsRepliedToByAuthors(authorNodes),
          },
          {
            label: 'Tweets mentioning authors',
            icon: <TweetIcon />,
            onMenuItemClick: () => addTweetsMentioningAuthors(authorNodes),
          },
          {
            label: 'Hashtags used',
            icon: <HashtagIcon />,
            onMenuItemClick: () => addHashtagsUsedByAuthors(authorNodes),
          },
        ],
        isDisabled: authorNodes.length === 0,
      },
      {
        label: 'Tweets',
        icon: <TweetIcon />,
        submenu: [
          {
            label: 'Authors',
            icon: <ProfileIcon />,
            onMenuItemClick: () => addTweetAuthorsToWorkspace(tweetNodes),
          },
          {
            label: 'Mentioned users',
            icon: <ProfileIcon />,
            onMenuItemClick: () => addMentionedAuthorsToWorkspace(tweetNodes),
          },
          {
            label: 'Parent tweets',
            icon: <TweetIcon />,
            onMenuItemClick: () => addParentTweetsToWorkspace(tweetNodes),
          },
          {
            label: 'Child tweets',
            icon: <TweetIcon />,
            onMenuItemClick: () => addChildTweetsToWorkspace(tweetNodes),
          },
          {
            label: 'Hashtags used',
            icon: <HashtagIcon />,
            onMenuItemClick: () => addTweetHashtagsToWorkspace(tweetNodes),
          },
        ],
        isDisabled: tweetNodes.length === 0,
      },
      {
        label: 'Hashtags',
        icon: <HashtagIcon />,
        submenu: [
          {
            label: 'Top authors by usage',
            icon: <ProfileIcon />,
            onMenuItemClick: () => highlightUsersForHashtags(hashtagNodes),
          },
          {
            label: 'Top tweets',
            icon: <TweetIcon />,
            onMenuItemClick: () => addTopTweetsByHashtags(hashtagNodes),
          },
          {
            label: 'Related hashtags',
            icon: <HashtagIcon />,
            onMenuItemClick: () => addRelatedHashtags(hashtagNodes),
          },
        ],
        isDisabled: hashtagNodes.length === 0,
      },
      {
        label: 'Remove from workspace',
        icon: <HideIcon />,
        onMenuItemClick: () => removeNodesFromWorkspace(nodes),
        isSeparator: true,
      },
    ];
  };

  async function handleGraphUpdate(action: () => Promise<GraphData>, successMessage: string, errorMessage: string) {
    try {
      const data = await action();

      if (areGraphDataEqual(data, workspaceData)) {
        showNotification('No changes detected in the graph.', BannerType.INFO);
        return;
      }

      setHasUnsavedChanges(true);
      setWorkspaceData({ nodes: data.nodes, links: data.links });
      showNotification(successMessage, BannerType.SUCCESS);
    } catch {
      showNotification(errorMessage, BannerType.ERROR);
    }
  }

  const addAuthorsLatestTweets = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addAuthorsLatestTweets(nodes),
      `Loaded latest 10 tweets for ${nodes.length} authors`,
      'Failed to load latest tweets'
    );

  const addAuthorsMostPopularTweets = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addAuthorsMostPopularTweets(nodes),
      `Loaded 10 most popular tweets for ${nodes.length} authors`,
      'Failed to load popular tweets'
    );

  const removeNodesFromWorkspace = async (nodes: GraphNode[]) =>
    handleGraphUpdate(() => GraphApiService.removeNodesFromWorkspace(nodes), `Removed ${nodes.length} nodes`, 'Failed to remove nodes');

  const addTweetAuthorsToWorkspace = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addTweetAuthorsToWorkspace(nodes),
      `Added authors for ${nodes.length} tweets`,
      'Failed to add authors'
    );

  const addTweetHashtagsToWorkspace = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addTweetHashtagsToWorkspace(nodes),
      `Added hashtags for ${nodes.length} tweets`,
      'Failed to add hashtags'
    );

  const addMentionedAuthorsToWorkspace = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addMentionedAuthorsToWorksapce(nodes),
      `Added mentioned authors for ${nodes.length} tweets`,
      'Failed to add mentioned authors'
    );

  const addParentTweetsToWorkspace = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addParentsTweetsToWorkspace(nodes),
      `Added parent tweets for ${nodes.length} tweets`,
      'Failed to add parent tweets'
    );

  const addChildTweetsToWorkspace = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addChildrenTweetsToWorkspace(nodes),
      `Added child tweets for ${nodes.length} tweets`,
      'Failed to add child tweets'
    );

  const highlightUsersForHashtags = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.highlightUsersForHashtags(nodes),
      `Highlighted top users for ${nodes.length} hashtags`,
      'Failed to highlight users'
    );

  const addTopTweetsByHashtags = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addTopTweetsByHashtags(nodes),
      `Added top tweets for ${nodes.length} hashtags`,
      'Failed to add top tweets'
    );

  const addRelatedHashtags = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addRelatedHashtags(nodes),
      `Added related hashtags for ${nodes.length} hashtags`,
      'Failed to add related hashtags'
    );

  const addAuthorsFromCommunities = async (nodes: GraphNode[], count?: number) =>
    handleGraphUpdate(
      () => GraphApiService.addAuthorsFromCommunities(nodes, count),
      count ? `Added top ${count} authors from communities (${nodes.length} total)` : `Added full communities for ${nodes.length} authors`,
      'Failed to add authors from communities'
    );

  const addHashtagsUsedByAuthors = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addHashtagsUsedByAuthors(nodes),
      `Added hashtags used by ${nodes.length} authors`,
      'Failed to load hashtags'
    );

  const addMentionedUsersByAuthors = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addMentionedUsersByAuthors(nodes),
      `Added mentioned users for ${nodes.length} authors`,
      'Failed to load mentioned users'
    );

  const addUsersMentioningAuthors = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addAuthorsMentioningAuthors(nodes),
      `Added users mentioning ${nodes.length} authors`,
      'Failed to load mentioning users'
    );

  const addUsersAuthorsReplyTo = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addAuthorsMostRepliedToByAuthors(nodes),
      `Added users authors reply to (${nodes.length} authors)`,
      'Failed to load replied users'
    );

  const addUsersReplyingToAuthors = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addAuthorsMostReplyingToAuthors(nodes),
      `Added users replying to ${nodes.length} authors`,
      'Failed to load replying users'
    );

  const addTweetsRepliedToByAuthors = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addTweetsRepliedToByAuthors(nodes),
      `Added tweets replied to by ${nodes.length} authors`,
      'Failed to load replies'
    );

  const addTweetsMentioningAuthors = async (nodes: GraphNode[]) =>
    handleGraphUpdate(
      () => GraphApiService.addTweetsMentioningAuthors(nodes),
      `Added tweets mentioning ${nodes.length} authors`,
      'Failed to load tweets'
    );

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

  return { getMultiMenuItems };
};
