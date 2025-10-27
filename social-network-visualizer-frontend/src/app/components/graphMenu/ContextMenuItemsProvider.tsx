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
        label: "Add Latest 10 Tweets",
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
        label: "Show hashtags",
        icon: <TweetIcon />,
        onMenuItemClick: () => console.log("Show tweet:", node.id),
      },
      {
        label: "Show Author",
        icon: <ProfileIcon />,
        onMenuItemClick: () => console.log("Show author for tweet:", node.id),
      },
    ];

    return [...tweetItems, ...getCommonMenuItems(node)];
  };

  const getHashtagMenuItems = (node: GraphNode): MenuItem[] => {
    const hashtagItems: MenuItem[] = [
      {
        label: "Show Top 10 authors",
        icon: <TweetIcon />,
        onMenuItemClick: () => console.log("Show Top 10 authors:", node.id),
      },
      {
        label: "Show Top 10 tweets",
        icon: <HashtagIcon />,
        onMenuItemClick: () => console.log("Show Top 10 tweets:", node.id),
      },
    ];

    return [...hashtagItems, ...getCommonMenuItems(node)];
  };

  const addLatestTweets = async (authorId: string) => {
    try {
      const data = await GraphApiService.addAuthorsLatestTweets(authorId);
      setHasUnsavedChanges(!areGraphDataEqual(data, workspaceData));
      setWorkspaceData({
        nodes: data.nodes || [],
        links: data.links || [],
      });

      showNotification(
        `Loaded top 10 tweets for "${authorId}"`,
        BannerType.SUCCESS,
      );
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
      setHasUnsavedChanges(!areGraphDataEqual(data, workspaceData));

      setWorkspaceData({
        nodes: data.nodes || [],
        links: data.links || [],
      });

      showNotification(`Node "${node.id} removed"`, BannerType.SUCCESS);
    } catch (error) {
      showNotification(`Failed to remove node "${node.id}"`, BannerType.ERROR);
    }
  };

  const addAuthorCommunityToWorkspace = async (
    communityId: string,
    numberOfAuthors: number,
  ) => {
    try {
      const data = await GraphApiService.addTopAuthorsFromCommunity(
        communityId,
        numberOfAuthors,
      );
      setHasUnsavedChanges(!areGraphDataEqual(data, workspaceData));
      setWorkspaceData({
        nodes: data.nodes || [],
        links: data.links || [],
      });

      const message =
        numberOfAuthors === -1
          ? `Entire community "${communityId}" added`
          : `Top ${numberOfAuthors} authors from community "${communityId}" added`;

      showNotification(message, BannerType.SUCCESS);
    } catch (error) {
      showNotification(
        `Failed to add authors from community "${communityId}"`,
        BannerType.ERROR,
      );
    }
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
