import {forwardRef, MouseEvent, useEffect, useImperativeHandle, useRef, useState} from "react";
// @ts-ignore
import ForceGraph, {ForceGraphInstance, LinkObject} from 'force-graph';
import {GraphLink, GraphNode, GraphProps, NodeType, SelectionBox} from "@/types/GraphTypes";
import {useProject} from "@/app/context/ProjectContext";
import nodeStrategy from "@/app/model/strategies/NodeStrategy";
import NodeColors from "@/app/model/NodeColors";
import {useWorkspace} from "@/app/context/WorkspaceContext";
import {useGraph} from "@/app/context/GraphContext";

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
        nodeFound
    } = props;

    const NODE_DISPLAY_LIMIT: number = 350;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fgInstance = useRef<ForceGraphInstance<GraphNode, GraphLink> | null>(null);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState<GraphNode[]>([]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const {setIsSidebarOpen, setSelectedUserData, setFocusedCommunityId, showLabels } = useProject();

    const clickedNodeRef = useRef<GraphNode | null>(null);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { isInWorkspaceMode, saveWorkspaceData, hasUnsavedChanges, setHasUnsavedChanges } = useWorkspace();
    const { setGraphData, resetGraphData } = useGraph();

    useEffect(() => {
        if (!containerRef.current) return;

        fgInstance.current = new ForceGraph<GraphNode, GraphLink>(containerRef.current);
        const handleResize = () => {
            if (fgInstance.current && containerRef.current) {
                const {offsetWidth, offsetHeight} = containerRef.current;
                fgInstance.current
                    .width(offsetWidth)
                    .height(offsetHeight);
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
        displayGraphData()
    }, [graphData, fgInstance]);

    useEffect(() => {
        if (!fgInstance.current || !nodeFound) return;
        const graphCurrentData = fgInstance.current.graphData();
        const node = graphCurrentData.nodes.find((n: GraphNode) => (n.id === nodeFound?.id && n.nodeType === nodeFound?.nodeType));

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
            .onNodeClick(handleNodeClick)
            .nodeCanvasObject((node: GraphNode & { x: number; y: number }, ctx: any, globalScale: any) => {
                const fontSize = 12 / globalScale;
                const radius = nodeStrategy.getRadius(node);
                ctx.font = `${fontSize}px Inter, sans-serif`;

                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = nodeColor ? nodeColor(node) : NodeColors.getDefaultAuthorColor();
                ctx.fill();


                if (selectedNodeIds.includes(node.id)) {
                    ctx.lineWidth = 2 / globalScale;
                    ctx.strokeStyle = 'white';
                    ctx.stroke();
                }

                if (showLabels) {
                    const nLabel = nodeLabel(node);
                    const textYPosition = node.y + radius + 4;
                    ctx.font = `${fontSize}px Inter, sans-serif`;
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    ctx.fillStyle = NodeColors.getWhiteColor();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(nLabel, node.x, textYPosition);
                    }
                }
            );
    }, [
        nodeVal,
        nodeLabel,
        nodeColor,
        linkColor,
        linkWidth,
        linkLabel,
        linkDirectionalArrowLength,
        linkDirectionalArrowRelPos,
        selectedNodeIds
    ]);


    const handleNodeClick = (node: GraphNode) => {
        if (clickedNodeRef.current && clickedNodeRef.current.id === node.id && clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            clickedNodeRef.current = null;

            handleDoubleNodeClick(node);
        } else {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }

            clickedNodeRef.current = node;
            clickTimeoutRef.current = setTimeout(() => {
                handleSingleNodeClick(node);
                clickedNodeRef.current = null;
                clickTimeoutRef.current = null;
            }, 300);
        }
    };

    const handleSingleNodeClick = (node: GraphNode) => {
        nodeStrategy.handleSingleNodeClick(node, setSelectedUserData, setIsSidebarOpen);
    }

    const handleDoubleNodeClick = (node: GraphNode) => {
        if (!fgInstance.current) return;
        setIsSidebarOpen(false);

        const currentGraphData = fgInstance.current.graphData();
        const currentNodeIds = new Set(currentGraphData.nodes.map((n: GraphNode) => n.id));

        const neighborLinks = graphData.links.filter(link => {
            return link.source === node.id || link.target === node.id;
        })

        const newNodes: GraphNode[] = [];
        const newLinks: LinkObject[] = [];

        neighborLinks.forEach(link => {
            const neighborId = link.source === node.id ? link.target : link.source;
            const neighborNode = graphData.nodes.find(n => n.id === neighborId);
            if (!currentNodeIds.has(neighborId) && neighborNode != undefined) {
                newNodes.push(neighborNode);
                newLinks.push(link);
            } else if (!currentGraphData.links.some((l: LinkObject) => {
                const existingSourceId = l.source;
                const existingTargetId = l.target;
                return (existingSourceId === link.source && existingTargetId === link.target) ||
                    (existingSourceId === link.target && existingTargetId === link.source);
            })) {
                newLinks.push(link);
            }
        });

        if (newNodes.length > 0 || newLinks.length > 0) {
            fgInstance.current.graphData({
                nodes: [...currentGraphData.nodes, ...newNodes],
                links: [...currentGraphData.links, ...newLinks]
            });
        }
    }

    useImperativeHandle(ref, (): { getInstance: () => ForceGraphInstance | null } => ({
        getInstance: () => fgInstance.current
    }));

    const analyzeSelectedNodes = () => {
        setIsSidebarOpen(false);

        if (selectedNodeIds.length !== 0) {
            const nodes = selectedNodes;
            const links = graphData.links.filter(l =>
                selectedNodes.find(n => n.id === l.source) &&
                selectedNodes.find(n => n.id === l.target)
            )

            setGraphData({nodes: nodes, links: links})
            setSelectedNodeIds([]);
            setHasUnsavedChanges(true);
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

        const nodesByType = new Map<NodeType, GraphNode[]>();
        graphData.nodes.forEach((node) => {
            if (!nodesByType.has(node.nodeType)) {
                nodesByType.set(node.nodeType, []);
            }
            nodesByType.get(node.nodeType)!.push(node);
        });

        const nodeTypes = Array.from(nodesByType.keys());
        const nodesPerType = Math.floor(NODE_DISPLAY_LIMIT / nodeTypes.length);

        // Take proportionally from each type (workaround)
        const topNodes: GraphNode[] = [];
        nodesByType.forEach((nodes, type) => {
            topNodes.push(
                ...nodes.slice(0, nodesPerType).map((n) => ({ ...n }))
            );
        });

        const topNodesIds = new Set(topNodes.map((n) => n.id));

        const relevantLinks = graphData.links
            .filter((link: GraphLink) => topNodesIds.has(link.source) && topNodesIds.has(link.target)
            )
            .map((link: GraphLink) => ({...link}));

        fgInstance.current.graphData({ nodes: topNodes, links: relevantLinks });
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        setIsSidebarOpen(false);
        e.preventDefault();
        e.stopPropagation();
        setIsSelecting(true);
        setSelectionBox({startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY});
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelecting) {
            setSelectionBox(prev => prev ? {...prev, endX: e.clientX, endY: e.clientY} : null);
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
            return (node.x >= Math.min(startCoords.x, endCoords.x) &&
                node.x <= Math.max(startCoords.x, endCoords.x) &&
                node.y >= Math.min(startCoords.y, endCoords.y) &&
                node.y <= Math.max(startCoords.y, endCoords.y));
        });

        setSelectedNodeIds(selectedNodes.map(n => n.id));
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
                {selectedNodeIds.length > 0 && (
                    <button
                        onClick={() => analyzeSelectedNodes()}
                        className="px-3 py-2 bg-[#384EB3] text-white border-none rounded-md cursor-pointer"
                    >
                        Analyze
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
                <button
                    onClick={() => resetGraph()}
                    className="px-3 py-2 bg-[#8B0000] text-white border-none rounded-md cursor-pointer"
                >
                    Reset graph
                </button>
            </div>
        </div>
    );
});

export default BaseGraph;
