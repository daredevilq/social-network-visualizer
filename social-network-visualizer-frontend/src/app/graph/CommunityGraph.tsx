"use client";

import { useEffect } from "react";
import { Link, Node } from "@/app/interface/GraphData";
import { useProject } from "@/app/context/ProjectContext";
import { FolderPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useNotification } from "@/app/context/NotificationProvider";
import { BannerType } from "@/app/components/Popups/Banner";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import type {ProjectConfigDto, RelationType,} from "@/app/interface/ConfigInterface";

const BaseGraph = dynamic(() => import("../model/BaseGraph"), { ssr: false });
export default function CommunityGraph() {
    const {
        loadedProjectName,
        loading,
        graphData,
        setGraphData,
        nodeFoundId,
        shortestPath,
        focusedCommunityId,
    } = useProject();

    const NUMBER_OF_COMMUNITIES = 15;
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!loadedProjectName) return;
        const fetchConfig = fetch(
            `${API_BASE_URL}/project/${encodeURIComponent(
                loadedProjectName
            )}/config`
        )
            .then((res) => {
                if (!res.ok)
                    throw new Error(`Failed to fetch config: ${res.status}`);
                return res.json() as Promise<ProjectConfigDto>;
            })
            .then((config: ProjectConfigDto): RelationType[] => {
                const communityMetric = config.metrics?.find(
                    (m) => m.type === "COMMUNITY"
                );
                if (
                    !communityMetric?.relationTypes ||
                    communityMetric.relationTypes.length === 0
                ) {
                    console.warn(
                        "No COMMUNITY metric found in config, using default MENTIONS"
                    );
                    return ["MENTIONS"];
                }
                return communityMetric.relationTypes;
            })
            .catch((err) => {
                console.error("Failed to fetch project config:", err);
                showNotification(
                    "Failed to load project configuration. Using default relations.",
                    BannerType.WARNING
                );
                return ["MENTIONS"] as RelationType[];
            });

        const fetchTopIds = fetch(
            `${API_BASE_URL}/community/top-ids?limit=${NUMBER_OF_COMMUNITIES}`
        )
            .then((res) => {
                if (!res.ok)
                    throw new Error(`Failed to fetch top ids: ${res.status}`);
                return res.text();
            })
            .then((txt) => {
                const parsed = JSON.parse(txt);
                return Array.isArray(parsed) ? (parsed as number[]) : [];
            });

        Promise.all([fetchConfig, fetchTopIds])
            .then(async ([relations, topIds]) => {
                const body = {
                    projectName: loadedProjectName,
                    relationTypes: relations,
                    communityId: focusedCommunityId
                        ? Number(focusedCommunityId)
                        : null,
                };

                const res = await fetch(`${API_BASE_URL}/graph/data`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                if (!res.ok)
                    throw new Error(`Failed to fetch graph: ${res.status}`);
                const data = await res.json();
                return { data, topIds };
            })
            .then(({ data, topIds }) => {
                const idSet = new Set(
                    topIds.map((id: number) => id.toString())
                );

                const nodes: Node[] = (data.nodes ?? [])
                    .filter((raw: any) =>
                        focusedCommunityId
                            ? raw.community?.toString() === focusedCommunityId
                            : idSet.has(raw.community?.toString())
                    )
                    .map((raw: any) => ({
                        id: raw.name,
                        label: raw.name,
                        pagerank: raw.pagerank ?? 0,
                        degreeCentrality: raw.centrality ?? 0,
                        community: raw.community?.toString() ?? "",
                    }));

                const nodeIds = new Set(nodes.map((n) => n.id));
                const links: Link[] = (data.edges ?? []).filter(
                    (l: any) => nodeIds.has(l.source) && nodeIds.has(l.target)
                );

                setGraphData({ nodes, links });
            })
            .catch((err) => {
                console.error("Failed to load community graph:", err);
                showNotification(
                    "Failed to load community graph data.",
                    BannerType.ERROR
                );
            });
    }, [loadedProjectName, loading, focusedCommunityId]);

    const getNodeColor = (node: any) => {
        return `hsl(${(node.community * 55) % 360}, 90%, 50%)`;
    };

    if (!loadedProjectName)
        return (
            <div className="h-full flex flex-col items-center justify-center text-[#fafafa]">
                <FolderPlus className="w-12 h-12 mb-4 text-[#fafafa]/60" />
                <p className="text-lg font-medium text-[#fafafa]/80">
                    Select a project to get started
                </p>
                <p className="text-sm text-[#fafafa]/50 mt-1">
                    Use the sidebar to pick one
                </p>
            </div>
        );

    return (
        <BaseGraph
            graphData={graphData}
            nodeVal={(node: any) => (node.pagerank ? node.pagerank * 7 : 10)}
            nodeLabel={(node: any) =>
                `${node.id}` + ` || Community: ${node.community}`
            }
            nodeColor={(node) => {
                if (node.id === nodeFoundId) return "red";
                return getNodeColor(node);
            }}
            linkColor={(link: any) =>
                shortestPath.includes(link.source.id) &&
                shortestPath.includes(link.target.id)
                    ? "red"
                    : "#fafafa"
            }
            linkWidth={(link: any) =>
                shortestPath.includes(link.source.id) &&
                shortestPath.includes(link.target.id)
                    ? 4
                    : 2
            }
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            nodeFoundId={nodeFoundId}
        />
    );
}
