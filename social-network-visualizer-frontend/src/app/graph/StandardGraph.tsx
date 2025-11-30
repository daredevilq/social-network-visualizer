import { useProject } from '@/app/context/ProjectContext';
import { FolderPlus } from 'lucide-react';

import dynamic from 'next/dynamic';
import { GraphLink, GraphNode } from '@/types/GraphTypes';
import nodeStrategy from '../model/strategies/NodeStrategy';
import Colors from '@/app/utils/Colors';
import { useGraph } from '@/app/context/GraphContext';
import linkStrategy from '@/app/model/strategies/LinkStrategy';

const BaseGraph = dynamic(() => import('./BaseGraph'), { ssr: false });

export default function StandardGraph() {
  const { loadedProjectName, nodeFound } = useProject();
  const { graphData, shortestPath, graphBridges } = useGraph();

  if (!loadedProjectName)
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-[#fafafa]">
        <FolderPlus className="w-12 h-12 mb-4 text-[#fafafa]/60" />
        <p className="text-lg font-medium text-[#fafafa]/80">Select a project to get started</p>
        <p className="text-sm text-[#fafafa]/50 mt-1">Use the sidebar to pick one</p>
      </div>
    );

  return (
    <div className="relative flex flex-col justify-center items-center h-screen w-full">
      <BaseGraph
        graphData={graphData}
        nodeVal={(node: GraphNode) => Math.min((nodeStrategy.getRadius(node) * nodeStrategy.getRadius(node)) / 12, 200)}
        nodeLabel={(node: GraphNode) => nodeStrategy.getLabel(node)}
        nodeColor={(node: GraphNode) => {
          if (node.id === nodeFound?.id && node.nodeType === nodeFound?.nodeType) return Colors.RedColor();

        if (shortestPath.some((n) => n.id === node.id)) {
            return Colors.GoldColor();
          }
          return nodeStrategy.getColor(node);
        }}
        linkColor={(link: any) => {
            const pathIds = shortestPath.map(n => n.id);
            const sourceIndex = pathIds.indexOf(link.source.id);
            const targetIndex = pathIds.indexOf(link.target.id);

            const inPath = sourceIndex !== -1 && targetIndex !== -1 && targetIndex === sourceIndex + 1;

            return inPath ? Colors.GoldColor() : linkStrategy.getColor(link);
        }}

        linkWidth={(link: any) => {
            const pathIds = shortestPath.map(n => n.id);
            const sourceIndex = pathIds.indexOf(link.source.id);
            const targetIndex = pathIds.indexOf(link.target.id);

            const inPath = sourceIndex !== -1 && targetIndex !== -1 && targetIndex === sourceIndex + 1;

            return inPath ? 4 : linkStrategy.getWidth(link);
        }}
        linkLabel={(link: GraphLink) => `${link.relation}: ${link.weight}`}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={1}
        nodeFound={nodeFound}
      />
    </div>
  );
}
