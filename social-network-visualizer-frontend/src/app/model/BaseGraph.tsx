import {forwardRef, MouseEvent, useEffect, useImperativeHandle, useRef, useState} from "react";
// @ts-ignore
import ForceGraph, {ForceGraphInstance, LinkObject, NodeObject} from 'force-graph';
import {GraphProps, SelectionBox} from '@/types/GraphTypes';
import {useProject} from "@/app/context/ProjectContext";
import {Node} from "@/app/interface/GraphData";

const BaseGraph  = forwardRef(({
  graphData,
  nodeVal,
  nodeLabel,
  nodeColor,
  linkColor,
  linkWidth,
  linkDirectionalArrowLength,
  linkDirectionalArrowRelPos,
  nodeFoundId
}: GraphProps, ref) => {
    const NODE_DISPLAY_LIMIT: number = 250;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fgInstance = useRef<ForceGraphInstance | null>(null);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const [workspaceNodes, setWorkspaceNodes] = useState<NodeObject[]>([]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const [displayedNodes, setDisplayedNodes] = useState<NodeObject[]>([]);
    const [displayedLinks, setDisplayedLinks] = useState<LinkObject[]>([]);

    const {setIsSidebarOpen, setSelectedUserData, setFocusedCommunityId, showLabels} = useProject();

    const clickedNodeRef = useRef<Node | null>(null);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    const handleSingleNodeClick = (node: Node) => {
        setSelectedUserData({
            name: node.id,
            community: node.community
        } as BasicUserData);
        setIsSidebarOpen(true);
    }

    const handleNodeClick = (node: Node) => {
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

    const handleDoubleNodeClick = (node: Node) => {
        if (!fgInstance.current) return;
        setIsSidebarOpen(false);

        const currentGraphData = fgInstance.current.graphData();
        const currentNodeIds = new Set(currentGraphData.nodes.map((n: NodeObject) => n.id));

        const neighborLinks = graphData.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return sourceId === node.id || targetId === node.id;
        })

        const newNodes: NodeObject[] = [];
        const newLinks: LinkObject[] = [];

        neighborLinks.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            const neighborId = sourceId === node.id ? targetId : sourceId;
            const neighborNode = graphData.nodes.find(n => n.id === neighborId);
            if (!currentNodeIds.has(neighborId) && neighborNode != undefined) {
                newNodes.push(neighborNode);
                newLinks.push(link);
            } else if (!currentGraphData.links.some((l: LinkObject) => {
                const existingSourceId = typeof l.source === 'object' ? l.source.id : l.source;
                const existingTargetId = typeof l.target === 'object' ? l.target.id : l.target;
                return (existingSourceId === sourceId && existingTargetId === targetId) ||
                    (existingSourceId === targetId && existingTargetId === sourceId);
            })) {
                newLinks.push(link);
            }
        });

        if (newNodes.length > 0 || newLinks.length > 0) {
            fgInstance.current.graphData({
                nodes: [...currentGraphData.nodes, ...newNodes],
                links: [...currentGraphData.links, ...newLinks]
            });
            setDisplayedNodes([...currentGraphData.nodes, ...newNodes]);
            setDisplayedLinks([...currentGraphData.links, ...newLinks]);
        }
    }

    useImperativeHandle(ref, (): { getInstance: () => ForceGraphInstance | null } => ({
        getInstance: () => fgInstance.current
    }));

    useEffect(() => {
        if (!containerRef.current) return;

        fgInstance.current = new ForceGraph<NodeObject, LinkObject>(containerRef.current);

        const handleResize = () => {
            if (fgInstance.current && containerRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;
                fgInstance.current
                    .width(offsetWidth)
                    .height(offsetHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            fgInstance.current = null;
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (fgInstance.current && graphData.nodes.length > 0) {
            const topNodes = graphData.nodes.slice(0, NODE_DISPLAY_LIMIT).map(n => ({ ...n }));
            const topNodesIds = new Set(topNodes.map(node => node.id));
            const relevantLinks = graphData.links.filter(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return topNodesIds.has(sourceId) && topNodesIds.has(targetId);
            }).map(l => ({ ...l }));

            setDisplayedNodes(topNodes);
            setDisplayedLinks(relevantLinks);

            fgInstance.current.graphData({
                nodes: topNodes,
                links: relevantLinks
            });
        }
    }, [graphData]);


    useEffect(() => {
        if (fgInstance.current && nodeFoundId) {
            const graphCurrentData = fgInstance.current.graphData();
            const node = graphCurrentData.nodes.find((n: NodeObject) => n.id === nodeFoundId);

            if (node) {
                fgInstance.current.centerAt(node.x, node.y, 1000);
                fgInstance.current.zoom(6, 1000);
            }
        }
    }, [nodeFoundId]);


    useEffect(() => {
        if (fgInstance.current) {
            fgInstance.current
                .nodeVal(nodeVal)
                .nodeLabel(nodeLabel)
                .nodeColor(nodeColor)
                .linkColor(linkColor)
                .linkWidth(linkWidth)
                .linkDirectionalArrowLength(linkDirectionalArrowLength)
                .linkDirectionalArrowRelPos(linkDirectionalArrowRelPos)
                .onNodeClick(handleNodeClick)
                .nodeCanvasObject((node: NodeObject & { x: number; y: number }, ctx: any, globalScale: any) => {
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    ctx.beginPath();

                    const r = (node as any).pagerank ? Math.pow((node as any).pagerank, 0.5) * 10 : 6;
                    ctx.arc(node.x, node.y, r, 0, 5 * Math.PI, false);

                    ctx.fillStyle = nodeColor ? nodeColor(node) : '#888';
                    ctx.fill();

                    if (selectedNodeIds.includes(node.id as string)) {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'white';
                        ctx.stroke();
                    }

                    if (showLabels) {
                        const label = nodeLabel(node);
                        ctx.font = `1000 Sans-Serif`;
                        ctx.fillStyle = '#bbb';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillText(label, node.x, node.y + r + 2);
                    }
                });
        }
    }, [nodeVal, nodeLabel, nodeColor, linkColor, linkWidth, linkDirectionalArrowLength, linkDirectionalArrowRelPos, selectedNodeIds]);

    const getSourceId = (l: LinkObject): string => typeof l.source === 'object' ? l.source.id as string : l.source as string;
    const getTargetId = (l: LinkObject): string => typeof l.target === 'object' ? l.target.id as string : l.target as string;

    const analyzeWorkspace = () => {
        setIsSidebarOpen(false);

        if (selectedNodeIds.length !== 0) {
            if (fgInstance.current) {
                const currZoom = fgInstance.current.zoom();

                fgInstance.current.graphData({
                    nodes: workspaceNodes,
                    links: graphData.links.filter(l =>
                        workspaceNodes.find(n => n.id === getSourceId(l)) &&
                        workspaceNodes.find(n => n.id === getTargetId(l))
                    )
                });

                fgInstance.current.zoom(currZoom);
            }

            setSelectedNodeIds([]);
        }
    };

    const resetGraph = () => {
        setIsSidebarOpen(false);
        setWorkspaceNodes([]);
        setSelectedNodeIds([]);
        loadGraphData();
        setFocusedCommunityId(undefined);
    };


    const loadGraphData = () => {
        if (fgInstance.current && graphData.nodes.length > 0) {
            const top5Nodes = graphData.nodes.slice(0, NODE_DISPLAY_LIMIT);
            const nodeIds = new Set(top5Nodes.map(node => node.id));

            const relevantLinks = graphData.links.filter(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return nodeIds.has(sourceId) && nodeIds.has(targetId);
            });

            setDisplayedNodes(top5Nodes);
            setDisplayedLinks(relevantLinks);

            fgInstance.current.graphData({
                nodes: top5Nodes,
                links: relevantLinks
            });
        }
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        setIsSidebarOpen(false);
        e.preventDefault();
        e.stopPropagation();
        setIsSelecting(true);
        setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelecting) {
            setSelectionBox(prev => prev ? { ...prev, endX: e.clientX, endY: e.clientY } : null);
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

        const nodes: NodeObject[] = fgInstance.current.graphData().nodes;
        const selectedNodes = nodes.filter((node: NodeObject) => {
            if (typeof node.x !== 'number' || typeof node.y !== 'number') return false;
            return node.x >= Math.min(startCoords.x, endCoords.x) &&
                node.x <= Math.max(startCoords.x, endCoords.x) &&
                node.y >= Math.min(startCoords.y, endCoords.y) &&
                node.y <= Math.max(startCoords.y, endCoords.y);
        });


        setSelectedNodeIds(selectedNodes.map(n => n.id as string));
        setWorkspaceNodes(selectedNodes);
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

            <div className="absolute bottom-2 right-2 flex flex-col gap-2 p-2 z-30">
                {selectedNodeIds.length > 0 && (
                    <button
                        onClick={analyzeWorkspace}
                        className="px-3 py-2 bg-[#384EB3] text-white border-none rounded-md cursor-pointer"
                    >
                        Analyze
                    </button>
                )}
                <button
                    onClick={resetGraph}
                    className="px-3 py-2 bg-[#A52734] text-white border-none rounded-md cursor-pointer"
                >
                    Reset workspace
                </button>
            </div>
        </div>
    );
});

export default BaseGraph;