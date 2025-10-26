import { MenuItem } from "@/app/interface/Menu";
import { GraphLink, GraphNode } from "@/types/GraphTypes";
import {
  ConnectionsIcon,
  HashtagIcon,
  HideIcon,
  ProfileIcon,
  TweetIcon,
} from "@/app/components/graphMenu/MenuIcons";
import { BannerType } from "@/app/components/Popups/Banner";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { useNotification } from "@/app/context/NotificationProvider";
import { GraphApiService } from "@/app/components/graphMenu/GraphMenuApiService";
import { GraphData } from "@/app/interface/GraphData";

export interface MenuItemsGetters {
  getAuthorMenuItems: (node: GraphNode) => MenuItem[];
  getTweetMenuItems: (node: GraphNode) => MenuItem[];
  getHashtagMenuItems: (node: GraphNode) => MenuItem[];
}

export const useContextMenuItems = (): MenuItemsGetters => {
  const { setWorkspaceData, setHasUnsavedChanges } = useWorkspace();
  const { showNotification } = useNotification();

  const getCommonMenuItems = (node: GraphNode): MenuItem[] => {
    return [
      {
        label: "Remove from workspace",
        icon: <HideIcon />,
        onClick: () => removeNodeFromWorkspace(node),
        isSeparator: true,
      },
    ];
  };

  const getAuthorMenuItems = (node: GraphNode): MenuItem[] => {
    const authorItems: MenuItem[] = [
      {
        label: "Show latest 10 tweets",
        icon: <ProfileIcon />,
        onClick: async () => addLatestTweets(node.id),
      },
      {
        label: "Show most related users",
        icon: <ConnectionsIcon />,
        onClick: () => console.log("Show connections:", node.id),
      },
    ];

    return [...authorItems, ...getCommonMenuItems(node)];
  };

  const getTweetMenuItems = (node: GraphNode): MenuItem[] => {
    const tweetItems: MenuItem[] = [
      {
        label: "Show Author",
        icon: <ProfileIcon />,
        onClick: async () => addTweetAuthorToWorkspace(node),
      },
      {
        label: "Show hashtags",
        icon: <TweetIcon />,
        onClick: async () => addTweetHashtagsToWorkspace(node),
      },
      {
        label: "Show mentioned users",
        icon: <ProfileIcon />,
        onClick: async () => addMentionedAuthorsToWorkspace(node),
      },
    ];

    return [...tweetItems, ...getCommonMenuItems(node)];
  };

  const getHashtagMenuItems = (node: GraphNode): MenuItem[] => {
    const hashtagItems: MenuItem[] = [
      {
        label: "Show Top 10 authors",
        icon: <TweetIcon />,
        onClick: async () => highlightUsersForHashtag(node),
      },
      {
        label: "Show Top 10 tweets",
        icon: <HashtagIcon />,
        onClick: async () => addHashtagTopAuthors(node),
      },
    ];

    return [...hashtagItems, ...getCommonMenuItems(node)];
  };

  async function handleGraphUpdate<T>(
    action: () => Promise<GraphData>,
    successMessage: string,
    errorMessage: string,
  ) {
    try {
      const data = await action();

      setWorkspaceData({
        nodes: data.nodes,
        links: data.links,
      });

      showNotification(successMessage, BannerType.SUCCESS);
      setHasUnsavedChanges(true);
    } catch (_err) {
      showNotification(errorMessage, BannerType.ERROR);
    }
  }

  const addLatestTweets = async (authorId: string) => {
    handleGraphUpdate(
      () => GraphApiService.addAuthorsLatestTweets(authorId),
      `Loaded top 10 tweets for "${authorId}"`,
      `Failed to load tweets for "${authorId}"`,
    );
  };

  const removeNodeFromWorkspace = async (node: GraphNode) => {
    handleGraphUpdate(
      () => GraphApiService.removeNodeFromWorkspace(node),
      `Node "${node.id}" removed`,
      `Failed to remove node "${node.id}"`,
    );
  };

  const addTweetAuthorToWorkspace = async (tweetNode: GraphNode) => {
    handleGraphUpdate(
      () => GraphApiService.addTweetAuthorToWorkspace(tweetNode),
      `Added author of tweet "${tweetNode.id}"`,
      `Failed to add author of tweet "${tweetNode.id}"`,
    );
  };

  const addTweetHashtagsToWorkspace = async (tweetNode: GraphNode) => {
    handleGraphUpdate(
      () => GraphApiService.addTweetHashtagsToWorkspace(tweetNode),
      `Added hashtags from tweet "${tweetNode.id}"`,
      `Failed to add hashtags from tweet "${tweetNode.id}"`,
    );
  };

  const addMentionedAuthorsToWorkspace = async (tweetNode: GraphNode) => {
    handleGraphUpdate(
      () => GraphApiService.addMentionedAuthorsToWorkspace(tweetNode),
      `Added mentioned authors from tweet  "${tweetNode.id}"`,
      `Failed to add mentioned authors from tweet "${tweetNode.id}"`,
    );
  };

  const highlightUsersForHashtag = async (hashtagNode: GraphNode) => {
    handleGraphUpdate(
      () => GraphApiService.highlightUsersForHashtag(hashtagNode),
      `Highlighted top 10 users for hashtag"${hashtagNode.id}"`,
      `Failed to highlight top users for hashtag "${hashtagNode.id}"`,
    );
  };

  const addHashtagTopAuthors = async (hashtagNode: GraphNode) => {
    handleGraphUpdate(
      () => GraphApiService.addHashtagTopAuthors(hashtagNode),
      `Added top 5 tweets for hashtag "${hashtagNode.id}"`,
      `Failed to add top tweets for hashtag "${hashtagNode.id}"`,
    );
  };

  return {
    getAuthorMenuItems,
    getTweetMenuItems,
    getHashtagMenuItems,
  };
};
