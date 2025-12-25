import { GraphNode } from '@/types/GraphTypes';

export const isLinkInPath = (link: any, shortestPath: GraphNode[]) => {
  const pathIds = shortestPath.map((n) => n.id);

  return shortestPath.some((_, i) => {
    if (i >= pathIds.length - 1) return false;
    const a = pathIds[i];
    const b = pathIds[i + 1];
    return link.source.id === a && link.target.id === b;
  });
};
