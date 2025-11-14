import { forwardRef, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
// @ts-ignore
import ForceGraph, { ForceGraphInstance } from 'force-graph';
import { forceManyBody, forceCollide, forceX, forceY, forceLink } from 'd3-force';
import { GraphLink, GraphNode, GraphProps, SelectionBox } from '@/types/GraphTypes';
import { useProject } from '@/app/context/ProjectContext';
import nodeStrategy from '@/app/model/strategies/NodeStrategy';
import Colors from '@/app/utils/Colors';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { useGraph } from '@/app/context/GraphContext';
import MenuComponent from '@/app/components/graphMenu/MenuComponent';
import { MenuItem, MenuState } from '../interface/Menu';
import { useContextMenuItems } from '@/app/components/graphMenu/ContextMenuItemsProvider';

interface ForceParameters {
  charge?: number;
  link?: number;
  collide?: number;
  centerX?: number;
  centerY?: number;
  containerStrength?: number;
}

const BaseGraph = forwardRef((props: GraphProps, ref) => {
  const {
    graphData,
    nodeVal,
    nodeLabel,
    nodeColor,
    linkColor,
    linkWidth,
    linkLabel,
    linkDirectionalArrowLength,
    linkDirectionalArrowRelPos,
    nodeFound,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgInstance = useRef<ForceGraphInstance<GraphNode, GraphLink> | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<GraphNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const [menu, setMenu] = useState<MenuState>({
    items: [],
    position: { x: 0, y: 0 },
  });

  const { isSidebarOpen, setIsSidebarOpen, selectedUserData, setSelectedUserData, setFocusedCommunityId, showLabels } = useProject();
  const menuItemsGetters = useContextMenuItems();
  const { setNodeFound } = useProject();
  const { isInWorkspaceMode, saveWorkspaceData, hasUnsavedChanges, openWorkspaceCreateModal } = useWorkspace();
  const { resetGraphData } = useGraph();

  const applyForces = useCallback((params: ForceParameters) => {
    if (!fgInstance.current) return;

    const { charge, link, collide, centerX, centerY, containerStrength } = params;

    if (link !== undefined) {
      fgInstance.current.d3Force(
        'link',
        forceLink<GraphNode, GraphLink>()
          .id((d: GraphNode) => d.id)
          .strength(link)
      );
    }
    if (collide !== undefined) {
      fgInstance.current.d3Force(
        'collide',
        forceCollide()
          .radius((d: any) => nodeStrategy.getRadius(d) + 10)
          .strength(collide)
      );
    }
    if (charge !== undefined) fgInstance.current.d3Force('charge', forceManyBody().distanceMin(10).strength(charge));
    if (centerX !== undefined) fgInstance.current.d3Force('container_x', forceX(centerX).strength(containerStrength ?? 0.005));
    if (centerY !== undefined) fgInstance.current.d3Force('container_y', forceY(centerY).strength(containerStrength ?? 0.005));
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    if (!containerRef.current) return;

    fgInstance.current = new ForceGraph<GraphNode, GraphLink>(containerRef.current);
    applyForces({ charge: -200, collide: 0.3, centerX: 0, centerY: 0, link: 0.7 });
    const handleResize = () => {
      if (fgInstance.current && containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        fgInstance.current.width(offsetWidth).height(offsetHeight);
        applyForces({ centerX: offsetWidth / 2, centerY: offsetHeight / 2, containerStrength: 0.01 });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      if (fgInstance.current) {
        fgInstance.current._destructor();
      }
      fgInstance.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    displayGraphData();
  }, [graphData, fgInstance]);

  useEffect(() => {
    if (!fgInstance.current || !nodeFound) return;
    const graphCurrentData = fgInstance.current.graphData();
    const node = graphCurrentData.nodes.find((n: GraphNode) => n.id === nodeFound?.id && n.nodeType === nodeFound?.nodeType);

    if (node && 'x' in node && 'y' in node) {
      fgInstance.current.centerAt(node.x, node.y, 1000);
      fgInstance.current.zoom(6, 1000);
    }
  }, [nodeFound]);

  useEffect(() => {
    if (!fgInstance.current) return;

    fgInstance.current
      .nodeVal(nodeVal)
      .nodeLabel(nodeLabel)
      .nodeColor(nodeColor)
      .linkColor(linkColor)
      .linkWidth(linkWidth)
      .linkLabel(linkLabel)
      .linkDirectionalArrowLength(linkDirectionalArrowLength)
      .linkDirectionalArrowRelPos(linkDirectionalArrowRelPos)
      .linkCurvature(0.4)
      .onNodeClick(handleNodeLeftClick)
      .onNodeRightClick(handleNodeRightClick)
      .nodeCanvasObject((node: GraphNode & { x: number; y: number }, ctx: CanvasRenderingContext2D, globalScale: any) => {
        if (!isFinite(node.x) || !isFinite(node.y)) {
          return;
        }

        const radius = nodeStrategy.getRadius(node);
        const baseColor = nodeColor ? nodeColor(node) : Colors.DefaultAuthorColor();

        if (!isFinite(radius) || radius <= 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 0.5 / globalScale, 0, 2 * Math.PI, false);
          ctx.fillStyle = baseColor;
          ctx.fill();
          return;
        }

        ctx.save();
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = baseColor;
        ctx.fill();

        ctx.restore();

        if (selectedNodeIds.includes(node.id)) {
          ctx.save();
          ctx.shadowColor = 'white';
          ctx.shadowBlur = 10;

          ctx.lineWidth = 2 / globalScale;
          ctx.strokeStyle = 'white';

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 1 / globalScale, 0, 2 * Math.PI, false);
          ctx.stroke();

          ctx.restore();
        }

        const fontSize = 12 / globalScale;
        if (showLabels) {
          const nLabel = nodeLabel(node);
          const textYPosition = node.y + radius + 4;
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(nLabel, node.x, textYPosition);
        }
      });
  }, [
    nodeVal,
    nodeLabel,
    nodeColor,
    linkColor,
    linkWidth,
    linkLabel,
    linkDirectionalArrowLength,
    linkDirectionalArrowRelPos,
    selectedNodeIds,
  ]);

  const handleNodeLeftClick = useCallback(
    (node: GraphNode) => {
      setNodeFound(null);
      if (isSidebarOpen && selectedUserData && selectedUserData.name === node.id && selectedUserData.nodeType === node.nodeType) {
        setIsSidebarOpen(false);
        setSelectedUserData(null);
        return;
      }

      setSelectedUserData({
        name: node.id,
        community: node.community ? node.community : '',
        nodeType: node.nodeType,
      });
      setIsSidebarOpen(true);
    },
    [isSidebarOpen, selectedUserData, setIsSidebarOpen, setSelectedUserData]
  );

  const handleNodeRightClick = useCallback(
    (node: GraphNode, event: MouseEvent) => {
      setNodeFound(null);
      if (isInWorkspaceMode) {
        const menuItems: MenuItem[] = nodeStrategy.getContextMenuItems(node, menuItemsGetters);
        setMenu({
          items: menuItems,
          position: { x: event.clientX, y: event.clientY },
        });
      }
    },
    [isInWorkspaceMode]
  );

  const handleCloseMenu = useCallback(() => {
    setMenu((prev: MenuState) => ({ ...prev, items: [] }));
  }, []);

  const createNewWorkspaceWithNodes = () => {
    setIsSidebarOpen(false);

    if (selectedNodeIds.length !== 0) {
      const nodes = selectedNodes;
      const links = graphData.links.filter(
        (l) => selectedNodes.find((n) => n.id === l.source) && selectedNodes.find((n) => n.id === l.target)
      );

      openWorkspaceCreateModal({ nodes, links });
      setSelectedNodeIds([]);
    }
  };

  const resetGraph = () => {
    setIsSidebarOpen(false);
    setSelectedNodes([]);
    setSelectedNodeIds([]);
    resetGraphData();
    setFocusedCommunityId(undefined);
  };

  const displayGraphData = () => {
    if (!fgInstance.current) return;

    const displayNodeIds = new Set(graphData.nodes.map((n: GraphNode) => n.id));

    const displayLinks = graphData.links
      .filter((link: GraphLink) => displayNodeIds.has(link.source) && displayNodeIds.has(link.target))
      .map((link: GraphLink) => ({ ...link }));

    fgInstance.current.graphData({
      nodes: graphData.nodes,
      links: displayLinks,
    });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsSidebarOpen(false);
    e.preventDefault();
    e.stopPropagation();
    setIsSelecting(true);
    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelecting) {
      setSelectionBox((prev) => (prev ? { ...prev, endX: e.clientX, endY: e.clientY } : null));
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelecting && selectionBox) {
      setIsSelecting(false);
      checkNodesInBox(selectionBox);
      setSelectionBox(null);
    }
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const checkNodesInBox = (box: SelectionBox) => {
    if (!fgInstance.current || !fgInstance.current.screen2GraphCoords) return;

    const startCoords = fgInstance.current.screen2GraphCoords(box.startX, box.startY);
    const endCoords = fgInstance.current.screen2GraphCoords(box.endX, box.endY);

    const nodes: GraphNode[] = fgInstance.current.graphData().nodes;
    const selectedNodes = nodes.filter((node: GraphNode) => {
      if (typeof node.x !== 'number' || typeof node.y !== 'number') return false;
      return (
        node.x >= Math.min(startCoords.x, endCoords.x) &&
        node.x <= Math.max(startCoords.x, endCoords.x) &&
        node.y >= Math.min(startCoords.y, endCoords.y) &&
        node.y <= Math.max(startCoords.y, endCoords.y)
      );
    });

    setSelectedNodeIds(selectedNodes.map((n) => n.id));
    setSelectedNodes(selectedNodes);
  };

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />

      <MenuComponent items={menu.items} position={menu.position} onClose={handleCloseMenu} />
      {selectionBox && (
        <div
          className="absolute border-2 border-dashed border-[#783CDC] bg-[#783CDC33] pointer-events-none z-10"
          style={{
            left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
            top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
            width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
            height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
          }}
        />
      )}

      <div className="absolute bottom-2 right-2 flex flex-col gap-2 p-2 z-30 w-[180px]">
        {selectedNodeIds.length > 0 && !isInWorkspaceMode && (
          <button
            onClick={() => createNewWorkspaceWithNodes()}
            className={`
                  px-3 py-2 rounded-md border-none
                  bg-[#384EB3] text-white cursor-pointer
                  hover:bg-[#2d3f99]
                  transition-colors
                `}
          >
            Create workspace
          </button>
        )}
        {isInWorkspaceMode && hasUnsavedChanges && (
          <button
            onClick={() => saveWorkspaceData(graphData)}
            className="px-3 py-2 bg-[green] text-white border-none rounded-md cursor-pointer"
          >
            Save workspace
          </button>
        )}
        <button onClick={() => resetGraph()} className="px-3 py-2 bg-[#8B0000] text-white border-none rounded-md cursor-pointer">
          Reset graph
        </button>
      </div>
    </div>
  );
});

export default BaseGraph;
