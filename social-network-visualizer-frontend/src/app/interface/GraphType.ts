export enum GraphType {
    STANDARD = 'standardGraph',
    MENTIONS = 'mentionsGraph',
    DEGREE_CENTRALITY = 'degreeCentralityGraph',
    COMMUNITY = 'communityGraph',
}

export const graphTypeItems = [
    { value: GraphType.STANDARD, label: "Standard Graph" },
    { value: GraphType.MENTIONS, label: "Mentions Graph" },
    { value: GraphType.DEGREE_CENTRALITY, label: "Degree Centrality Graph" },
    { value: GraphType.COMMUNITY, label: "Community Graph" },
];