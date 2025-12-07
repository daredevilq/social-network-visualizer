import { useRouter } from 'next/navigation';
import { useProject } from '@/app/context/ProjectContext';
import { GraphType } from '@/app/interface/GraphType';
import { setGraphUiType } from '@/app/project-state';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { MetricConfig } from '@/types/GraphTypes';
import { FetchStrategy, GraphQueryRequest } from '@/types/GraphQueryRequest';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';
import { useWorkspace } from '@/app/context/WorkspaceContext';

export function useCommunityGraphNavigation() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { setFocusedCommunityId, setSelectedGraphType, fetchGraphData, loadedProjectName, setSelectedNodeTypes, setSelectedRelationTypes } =
    useProject();
  const { setIsInWorkspaceMode, setOpenedWorkspaceName } = useWorkspace();

  const openCommunityGraph = async (communityId: number) => {
    if (!loadedProjectName) {
      showNotification('No project loaded. Please select a project first.', BannerType.WARNING);
      return;
    }

    setIsInWorkspaceMode(false);
    setOpenedWorkspaceName(null);

    try {
      const res = await fetch(`${API_BASE_URL}/community/${loadedProjectName}/metric-config`);
      if (!res.ok) {
        if (res.status === 404) {
          showNotification(`No COMMUNITY metric configuration found for project "${loadedProjectName}".`, BannerType.WARNING);
        } else {
          showNotification(`Failed to fetch metric configuration: ${res.status}`, BannerType.ERROR);
        }
        return;
      }
      const config: MetricConfig = await res.json();

      const request: GraphQueryRequest = {
        nodeTypes: config.nodeTypes,
        relationTypes: config.relationTypes,
        fetchConfig: {
          strategy: FetchStrategy.ALL,
        },
        focusedCommunityId: communityId,
      };

      await fetchGraphData(request);
      setFocusedCommunityId(communityId);
      setSelectedNodeTypes(config.nodeTypes);
      setSelectedRelationTypes(config.relationTypes);
      await setGraphUiType(GraphType.COMMUNITY);
      setSelectedGraphType(GraphType.COMMUNITY);

      showNotification(`Loading community #${communityId} graph...`, BannerType.SUCCESS);
      router.push('/');
    } catch (error) {
      console.error('Error opening community graph:', error);
      showNotification('Failed to open community graph. Please try again.', BannerType.ERROR);
    }
  };

  return { openCommunityGraph };
}
