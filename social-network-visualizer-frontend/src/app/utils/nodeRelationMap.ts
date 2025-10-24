import { NodeType, RelationType } from "@/types/GraphTypes";

export const RELATION_NODE_MAP: Record<RelationType, [NodeType, NodeType]> = {
  [RelationType.MENTIONS]: [NodeType.AUTHOR, NodeType.AUTHOR],
  [RelationType.RETWEETS]: [NodeType.AUTHOR, NodeType.AUTHOR],
  [RelationType.SHARES_HASHTAG]: [NodeType.AUTHOR, NodeType.AUTHOR],
  [RelationType.REPLIES]: [NodeType.AUTHOR, NodeType.AUTHOR],
  [RelationType.POSTED]: [NodeType.AUTHOR, NodeType.TWEET],
  [RelationType.USES_HASHTAG]: [NodeType.AUTHOR, NodeType.HASHTAG],
  [RelationType.HAS_PARENT]: [NodeType.TWEET, NodeType.TWEET],
  [RelationType.RETWEETED]: [NodeType.TWEET, NodeType.TWEET],
  [RelationType.QUOTED]: [NodeType.TWEET, NodeType.TWEET],
  [RelationType.REPLY_TO]: [NodeType.TWEET, NodeType.TWEET],
  [RelationType.MENTION]: [NodeType.TWEET, NodeType.AUTHOR],
  [RelationType.HAS_REPLY]: [NodeType.TWEET, NodeType.AUTHOR],
  [RelationType.HAS_HASHTAG]: [NodeType.TWEET, NodeType.HASHTAG],
};

export function isRelationAvailable(
  relationType: RelationType,
  selectedNodeTypes: NodeType[],
): boolean {
  const nodeTypes = RELATION_NODE_MAP[relationType];
  if (!nodeTypes) return false;

  const [sourceType, targetType] = nodeTypes;
  const selectedSet = new Set(selectedNodeTypes);

  return selectedSet.has(sourceType) && selectedSet.has(targetType);
}

export function filterValidRelations(
  relationTypes: RelationType[],
  selectedNodeTypes: NodeType[],
): RelationType[] {
  return relationTypes.filter((rel) =>
    isRelationAvailable(rel, selectedNodeTypes),
  );
}
