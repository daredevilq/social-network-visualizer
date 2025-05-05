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
                              }: GraphProps, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fgInstance = useRef<ForceGraphInstance | null>(null);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const [workspaceNodes, setWorkspaceNodes] = useState<NodeObject[]>([]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const {setIsSidebarOpen, setSelectedUserName} = useProject();
    const handleSingleNodeClick = (node: Node) => {
        setSelectedUserName(node.id);
        setIsSidebarOpen(true);
    };


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
        if (fgInstance.current) {
            fgInstance.current
                .nodeVal(nodeVal)
                .nodeLabel(nodeLabel)
                .nodeColor(nodeColor)
                .linkColor(linkColor)
                .linkWidth(linkWidth)
                .linkDirectionalArrowLength(linkDirectionalArrowLength)
                .linkDirectionalArrowRelPos(linkDirectionalArrowRelPos)
                .onNodeClick(handleSingleNodeClick)
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
                .onNodeClick(onNodeClick)
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
        <div style={{width: "100%", height: "100%", position: "relative"}}>
            <div
                ref={containerRef}
                style={{width: "100%", height: "100%"}}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
            />

            {selectionBox && (
                <div
                    style={{
                        position: 'absolute',
                        left: Math.min(selectionBox.startX, selectionBox.endX),
                        top: Math.min(selectionBox.startY, selectionBox.endY),
                        width: Math.abs(selectionBox.endX - selectionBox.startX),
                        height: Math.abs(selectionBox.endY - selectionBox.startY),
                        border: '2px dashed rgba(120, 60, 220, 0.7)',
                        backgroundColor: 'rgba(120, 60, 220, 0.2)',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                />
            )}

            <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '10px',
                zIndex: 30
            }}>

                {selectedNodeIds.length > 0 && (
                    <button
                        onClick={analyzeWorkspace}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgb(56, 78, 179)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Analyze
                    </button>
                )}
                <button onClick={resetGraph} style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgb(165, 39, 52)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}>
                    Reset workspace
                </button>
            </div>
        </div>
    );
});

export default BaseGraph;