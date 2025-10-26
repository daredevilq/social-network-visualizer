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
        label: "Show Latest 10 Tweets",
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
        label: "Show hashtags",
        icon: <TweetIcon />,
        onClick: () => console.log("Show tweet:", node.id),
      },
      {
        label: "Show Author",
        icon: <ProfileIcon />,
        onClick: () => console.log("Show author for tweet:", node.id),
      },
    ];

    return [...tweetItems, ...getCommonMenuItems(node)];
  };

  const getHashtagMenuItems = (node: GraphNode): MenuItem[] => {
    const hashtagItems: MenuItem[] = [
      {
        label: "Show Top 10 authors",
        icon: <TweetIcon />,
        onClick: () => console.log("Show Top 10 authors:", node.id),
      },
      {
        label: "Show Top 10 tweets",
        icon: <HashtagIcon />,
        onClick: () => console.log("Show Top 10 tweets:", node.id),
      },
    ];

    return [...hashtagItems, ...getCommonMenuItems(node)];
  };

  const addLatestTweets = async (authorId: string) => {
    try {
      const data = await GraphApiService.addAuthorsLatestTweets(authorId);
      console.log("Fetched top tweets for author:", authorId, data);

      setWorkspaceData({
        nodes: data.nodes || [],
        links: data.links || [],
      });

      showNotification(
        `Loaded top 10 tweets for "${authorId}"`,
        BannerType.SUCCESS,
      );
      setHasUnsavedChanges(true);
    } catch (error) {
      showNotification(
        `Failed to load tweets for "${authorId}"`,
        BannerType.ERROR,
      );
    }
  };

  const removeNodeFromWorkspace = async (node: GraphNode) => {
    try {
      const data = await GraphApiService.removeNodeFromWorkspace(node);
      console.log("Removed node:", node.id, data);

      setWorkspaceData({
        nodes: data.nodes || [],
        links: data.links || [],
      });

      showNotification(`Node "${node.id} removed"`, BannerType.SUCCESS);
      setHasUnsavedChanges(true);
    } catch (error) {
      showNotification(`Failed to remove node "${node.id}"`, BannerType.ERROR);
    }
  };

  return {
    getAuthorMenuItems,
    getTweetMenuItems,
    getHashtagMenuItems,
  };
};
