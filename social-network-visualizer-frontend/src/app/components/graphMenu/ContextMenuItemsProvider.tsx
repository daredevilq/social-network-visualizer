import { MenuItem } from "@/app/interface/Menu";
import { GraphNode } from "@/types/GraphTypes";
import {
  ConnectionsIcon,
  HashtagIcon,
  HideIcon,
  ProfileIcon,
  TweetIcon,
} from "@/app/components/graphMenu/MenuIcons";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import { GraphData } from "@/app/interface/GraphData";
import { BannerType } from "@/app/components/Popups/Banner";

interface ContextMenuDependencies {
  showNotification: (message: string, type: BannerType) => void;
  updateWorkspaceGraph: (newData: GraphData) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export class ContextMenuItemsProvider {
  private static dependencies: ContextMenuDependencies | null = null;

  static initialize(deps: ContextMenuDependencies) {
    this.dependencies = deps;
  }

  private static getCommonMenuItems(node: GraphNode): MenuItem[] {
    return [
      {
        label: "Hide Node",
        icon: <HideIcon />,
        onClick: () => {
          console.log("Hide node:", node.id);
        },
        isSeparator: true,
      },
    ];
  }

  public static getAuthorMenuItems(node: GraphNode): MenuItem[] {
    const authorItems: MenuItem[] = [
      {
        label: "Show Top 10 Tweets",
        icon: <ProfileIcon />,
        onClick: async () => {
          if (!this.dependencies) {
            console.error("ContextMenuItemsProvider not initialized");
            return;
          }

          try {
            const data = await this.fetchAuthorTopTweets(node.id);
            console.log("Fetched top tweets for author:", node.id, data);

            this.dependencies.updateWorkspaceGraph(data);
            this.dependencies.showNotification(
              `Loaded top 10 tweets for "${node.id}"`,
              BannerType.SUCCESS,
            );
            this.dependencies.setHasUnsavedChanges(true);
          } catch (error) {
            console.error(
              "Error fetching top tweets for author:",
              node.id,
              error,
            );
            this.dependencies.showNotification(
              `Failed to load tweets for "${node.id}"`,
              BannerType.ERROR,
            );
          }
        },
      },
      {
        label: "Show most related users",
        icon: <ConnectionsIcon />,
        onClick: () => console.log("Show connections:", node.id),
      },
    ];

    return [...authorItems, ...this.getCommonMenuItems(node)];
  }

  public static getTweetMenuItems(node: GraphNode): MenuItem[] {
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

    return [...tweetItems, ...this.getCommonMenuItems(node)];
  }

  public static getHashtagMenuItems(node: GraphNode): MenuItem[] {
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

    return [...hashtagItems, ...this.getCommonMenuItems(node)];
  }

  static async fetchAuthorTopTweets(authorId: string): Promise<GraphData> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/menu/author/${authorId}/top-tweets`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch top tweets for author: ${authorId} (${response.status})`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching author top tweets:", error);
      throw error;
    }
  }
}
