import {useEffect} from "react";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";
import dynamic from 'next/dynamic';

const BaseGraph = dynamic(() => import('../model/BaseGraph'), { ssr: false });
export default function AuthorMentionsGraph() {
    const {loadedProjectName, loading, graphData, nodeFoundId, graphRelationType, fetchGraphData} = useProject();

    useEffect(() => {
        if (!loadedProjectName || loading) return;
        fetchGraphData();
    }, [loadedProjectName, graphRelationType]);

    if (!loadedProjectName)
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
            nodeVal={(node: any) => (node.degreeCentrality ? node.degreeCentrality : 0)}
            nodeLabel={(node: any) => `${node.id}`}
            nodeColor={(node: any) => `hsl(${node.degreeCentrality * 40}, 100%, 50%)`}
            linkColor={(link: any) => (link.type === "mention" ? "red" : "#fafafa")}
            linkWidth={(link: any) => (link.type === "mention" ? 1 : 2)}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            nodeFoundId={nodeFoundId}
        />
    );
}


