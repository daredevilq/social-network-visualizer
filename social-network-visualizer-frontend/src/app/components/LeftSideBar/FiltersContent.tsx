'use client';

import {useProject } from "@/app/context/ProjectContext";
import {useState, useEffect} from "react";
import {Network, Layers} from "lucide-react";
import {useNotification} from '@/app/context/NotificationProvider';
import {BannerType} from "@/app/components/Popups/Banner";
import {RelationType, NodeType} from "@/types/GraphTypes";
import {GraphQueryRequest} from "@/types/GraphQueryRequest";

export default function FiltersContent() {
    const {
        selectedRelationTypes,
        selectedNodeTypes,
        setSelectedRelationTypes,
        setSelectedNodeTypes,
        runWithLoading,
        fetchGraphData,
    } = useProject();

    const { showNotification } = useNotification();

    const [tempNodeTypes, setTempNodeTypes] = useState<NodeType[]>(selectedNodeTypes);
    const [tempRelationTypes, setTempRelationTypes] = useState<RelationType[]>(selectedRelationTypes);

    useEffect(() => {setTempNodeTypes(selectedNodeTypes);setTempRelationTypes(selectedRelationTypes);}, [selectedNodeTypes, selectedRelationTypes]);

    const toggleNodeType = (nodeType: NodeType) => {
        setTempNodeTypes((prev) =>
            prev.includes(nodeType)
                ? prev.filter((t) => t !== nodeType)
                : [...prev, nodeType]
        );
    };

    const toggleRelationType = (relationType: RelationType) => {
        setTempRelationTypes((prev) =>
            prev.includes(relationType)
                ? prev.filter((t) => t !== relationType)
                : [...prev, relationType]
        );
    };

    const handleApply = async () => {
        if (tempNodeTypes.length === 0) {
            showNotification("Please select at least one node type",BannerType.ERROR);
            return;
        }

        if (tempRelationTypes.length === 0) {
            showNotification("Please select at least one relation type",BannerType.ERROR);
            return;
        }

        await runWithLoading(async () => {
            try {
                setSelectedNodeTypes(tempNodeTypes);
                setSelectedRelationTypes(tempRelationTypes);

                const request: GraphQueryRequest = {
                    nodeTypes: tempNodeTypes,
                    relationTypes: tempRelationTypes,
                };
                await fetchGraphData(request);
                showNotification("Filters applied successfully", BannerType.INFO);
            } catch (err: any) {
                showNotification(`Error updating graph: ${err.message || err}`,BannerType.ERROR);
            }
        });
    };

    return (
        <div className="relative h-full flex flex-col text-white px-4 pt-4">
            <h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">
                Graph Filters
            </h1>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Node Types
                </h2>
                <div className="space-y-2">
                    {Object.values(NodeType).map((nodeType) => (
                        <button
                            key={nodeType}
                            onClick={() => toggleNodeType(nodeType)}
                            className="flex items-center gap-3 w-full text-left py-2 px-3 rounded hover:bg-white/5 transition-colors"
                        >
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    tempNodeTypes.includes(nodeType)
                                        ? "border-[#7140F4] bg-[#7140F4]"
                                        : "border-gray-500"
                                }`}
                            >
                                {tempNodeTypes.includes(nodeType) && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                            <span className="truncate">{nodeType}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Relation Types
                </h2>
                <div
                    className="flex-1 overflow-y-auto space-y-2 pr-2"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#4B5563 #1F2937",
                    }}
                >
                    {Object.values(RelationType).map((relationType) => (
                        <button
                            key={relationType}
                            onClick={() => toggleRelationType(relationType)}
                            className="flex items-center gap-3 w-full text-left py-2 px-3 rounded hover:bg-white/5 transition-colors"
                        >
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    tempRelationTypes.includes(relationType)
                                        ? "border-[#7140F4] bg-[#7140F4]"
                                        : "border-gray-500"
                                }`}
                            >
                                {tempRelationTypes.includes(relationType) && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                            <span className="truncate">{relationType}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 pb-2 border-t border-white/20 mt-4">
                <button
                    onClick={handleApply}
                    className="w-full py-3 bg-[#7140F4] hover:bg-[#5a33c4] text-white font-semibold rounded-lg transition-colors"
                >
                    Apply Filters
                </button>
            </div>

            <style jsx>{`
                div::-webkit-scrollbar {
                    width: 8px;
                }
                div::-webkit-scrollbar-track {
                    background: #1f2937;
                    border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
            `}</style>
        </div>
    );
}
