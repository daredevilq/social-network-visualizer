import {useEffect} from "react";
import {Link, Node} from "@/app/interface/GraphData";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";
import dynamic from 'next/dynamic';

const BaseGraph = dynamic(() => import('../model/BaseGraph'), { ssr: false });

export default function AuthorPagerankGraph() {
    const {selected, loading, graphData, setGraphData, shortestPath, nodeFoundId, graphRelationType} = useProject();

    useEffect(() => {
        if (!selected || loading) return;
        fetch(`http://localhost:8080/graph/${graphRelationType}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.nodes || !Array.isArray(data.nodes) || !data.edges || !Array.isArray(data.edges)) {
                    console.error("Invalid data format:", data);
                    return;
                }
                const links: Link[] = data.edges.map((link: { source: any; target: any; }) => ({
                    ...link,
                    type: link.source === link.target ? "mention" : "retweet",
                }));
                const nodes: Node[] = data.nodes.map((node: any) => ({
                    id: node.name,
                    label: node.name,
                    pagerank: node.pagerank ?? 0,
                    degreeCentrality: node.centrality ?? 0,
                    community: node.community?.toString() ?? ""
                }));
                setGraphData({nodes, links});
            })
            .catch((err) => console.error("Fetch error:", err));
    }, [selected, loading]);

    if (!selected)
        return (
            <div className="h-full flex flex-col items-center justify-center text-[#fafafa]">
                <FolderPlus className="w-12 h-12 mb-4 text-[#fafafa]/60"/>
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
            nodeVal={(node: any) => (node.degreeCentrality ? node.degreeCentrality * 5 : 1)}
            nodeLabel={(node: any) =>
                `User: ${node.id}\n Degree Centrality: ${node.degreeCentrality}`
            }
            nodeColor={(node: any) => {
                const baseHue = 240;
                const degreeHue = node.pagerank * 80;
                const finalHue = baseHue + degreeHue;
                return `hsl(${finalHue}, 73%, 54%)`;
            }}
            linkColor={(link: any) =>
                shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? "red" : "#fafafa"
            }
            linkWidth={(link: any) =>
                shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? 3 : 2
            }
            linkDirectionalArrowLength={7}
            linkDirectionalArrowRelPos={1}
            nodeFoundId={nodeFoundId}
        />
    );
}

