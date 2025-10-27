import { MenuItem } from "@/app/interface/Menu";
import {
  AuthorNode,
  GraphLink,
  GraphNode,
  HashtagNode,
  TweetNode,
} from "@/types/GraphTypes";
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
  getAuthorMenuItems: (node: AuthorNode) => MenuItem[];
  getTweetMenuItems: (node: TweetNode) => MenuItem[];
  getHashtagMenuItems: (node: HashtagNode) => MenuItem[];
}

export const useContextMenuItems = (): MenuItemsGetters => {
  const { workspaceData, setWorkspaceData, setHasUnsavedChanges } =
    useWorkspace();
  const { showNotification } = useNotification();

  const getCommonMenuItems = (node: GraphNode): MenuItem[] => {
    return [
      {
        label: "Remove from workspace",
        icon: <HideIcon />,
        onMenuItemClick: () => removeNodeFromWorkspace(node),
        isSeparator: true,
      },
    ];
  };

  const getAuthorMenuItems = (node: AuthorNode): MenuItem[] => {
    const authorItems: MenuItem[] = [
      {
        label: "Add latest 10 tweets",
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addLatestTweets(node.id),
      },
      {
        label: "Add Authors from Community",
        icon: <ConnectionsIcon />,
        submenu: [
          {
            label: "Add 10 authors from community",
            icon: <ConnectionsIcon />,
            onMenuItemClick: () =>
              addAuthorCommunityToWorkspace(node.community, 10),
          },
          {
            label: "Add entire community",
            icon: <ConnectionsIcon />,
            onMenuItemClick: () =>
              addAuthorCommunityToWorkspace(node.community, -1),
          },
        ],
      },
    ];

    return [...authorItems, ...getCommonMenuItems(node)];
  };

  const getTweetMenuItems = (node: GraphNode): MenuItem[] => {
    const tweetItems: MenuItem[] = [
      {
        label: "Show Author",
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addTweetAuthorToWorkspace(node),
      },
      {
        label: "Show hashtags",
        icon: <TweetIcon />,
        onMenuItemClick: async () => addTweetHashtagsToWorkspace(node),
      },
      {
        label: "Show mentioned users",
        icon: <ProfileIcon />,
        onMenuItemClick: async () => addMentionedAuthorsToWorkspace(node),
      },
    ];

    return [...tweetItems, ...getCommonMenuItems(node)];
  };

  const getHashtagMenuItems = (node: GraphNode): MenuItem[] => {
    const hashtagItems: MenuItem[] = [
      {
        label: "Show Top 10 authors",
        icon: <TweetIcon />,
        onMenuItemClick: async () => highlightUsersForHashtag(node),
      },
      {
        label: "Show Top 10 tweets",
        icon: <HashtagIcon />,
        onMenuItemClick: async () => addHashtagTopAuthors(node),
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

  const addAuthorCommunityToWorkspace = async (
    communityId: string,
    numberOfAuthors: number,
  ) => {
    handleGraphUpdate(
      () =>
        GraphApiService.addTopAuthorsFromCommunity(
          communityId,
          numberOfAuthors,
        ),
      numberOfAuthors === -1
        ? `Entire community "${communityId}" added`
        : `Top ${numberOfAuthors} authors from community "${communityId}" added`,
      `Failed to add authors from community "${communityId}"`,
    );
  };

  const areGraphDataEqual = (
    currentData: GraphData,
    newData: GraphData,
  ): boolean => {
    if (
      currentData.nodes.length !== newData.nodes.length &&
      currentData.links.length !== newData.links.length
    ) {
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

    const currentLinks = new Set(
      currentData.links.map(
        (link: GraphLink) => `${link.source}-${link.target}`,
      ),
    );
    const newLinks = new Set(
      newData.links.map((link: GraphLink) => `${link.source}-${link.target}`),
    );

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
