import {forwardRef, MouseEvent, useEffect, useImperativeHandle, useRef, useState} from "react";
import ForceGraph, {ForceGraphInstance, LinkObject, NodeObject} from 'force-graph';
import {GraphProps, SelectionBox} from '@/types/GraphTypes';
import {useProject} from "@/app/context/ProjectContext";
import {Node} from "@/app/interface/GraphData";

const BaseGraph = forwardRef(({
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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fgInstance = useRef<ForceGraphInstance | null>(null);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const [workspaceNodes, setWorkspaceNodes] = useState<NodeObject[]>([]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const {setIsSidebarOpen, setSelectedUserName} = useProject();

    const clickedNodeRef = useRef<Node | null>(null);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    const handleSingleNodeClick = (node: Node) => {
        setSelectedUserName(node.id);
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

        const graphCurrentData = fgInstance.current.graphData();
        const newNodes = [];
        const newLinks = [];

        for (let i = 0; i < 5; i++) {
            const newNodeId = `${node.id}_child_${Date.now()}_${i}`;
            newNodes.push({
                id: newNodeId,
                label: `Child of ${node.id} (${i + 1})`,
                pagerank: Math.random() * 0.5,
                degreeCentrality: Math.random(),
                community: (node as any).community || "new",
                x: (node as any).x + (Math.random() - 0.5) * 50,
                y: (node as any).y + (Math.random() - 0.5) * 50,
            });

            newLinks.push({
                source: node.id,
                target: newNodeId,
                type: "generated"
            });

            fgInstance.current.graphData({
                nodes: [...graphCurrentData.nodes, ...newNodes],
                links: [...graphCurrentData.links, ...newLinks]
            });
        }
    }

    useImperativeHandle(ref, (): { getInstance: () => ForceGraphInstance | null } => ({
        getInstance: () => fgInstance.current
    }));

    useEffect(() => {
        if (!containerRef.current) return;

        fgInstance.current = new ForceGraph<NodeObject, LinkObject>(containerRef.current);

        return () => {
            fgInstance.current = null;
        };
    }, []);

    useEffect(() => {
        if (fgInstance.current) {
            fgInstance.current.graphData(graphData);
        }
    }, [graphData]);

    useEffect(() => {
        if (fgInstance.current && nodeFoundId) {
            const graphCurrentData = fgInstance.current.graphData();
            const node = graphCurrentData.nodes.find(n => n.id === nodeFoundId);

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
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = nodeColor ? nodeColor(node) : 'gray';
                    ctx.fill();

                    if (selectedNodeIds.includes(node.id as string)) {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'white';
                        ctx.stroke();
                    }
                });
        }
    }, [nodeVal, nodeLabel, nodeColor, linkColor, linkWidth, linkDirectionalArrowLength, linkDirectionalArrowRelPos, selectedNodeIds]);

    const getSourceId = (l: LinkObject): string => typeof l.source === 'object' ? l.source.id as string : l.source as string;
    const getTargetId = (l: LinkObject): string => typeof l.target === 'object' ? l.target.id as string : l.target as string;

    const analyzeWorkspace = () => {
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
        setWorkspaceNodes([]);
        setSelectedNodeIds([]);
        loadGraphData();
    };

    const loadGraphData = () => {
        if (fgInstance.current) {
            fgInstance.current
                .graphData(graphData)
                .nodeVal(nodeVal)
                .nodeLabel(nodeLabel)
                .nodeColor(nodeColor)
                .linkColor(linkColor)
                .linkWidth(linkWidth)
                .linkDirectionalArrowLength(linkDirectionalArrowLength)
                .linkDirectionalArrowRelPos(linkDirectionalArrowRelPos)
                .nodeCanvasObject((node: NodeObject & { x: number; y: number }, ctx: any, globalScale: any) => {
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = nodeColor ? nodeColor(node) : 'gray';
                    ctx.fill();

                    if (selectedNodeIds.includes(node.id as string)) {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'white';
                        ctx.stroke();
                    }
                });
        }
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
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