export enum GraphType {
    STANDARD = 'standardGraph',
    MENTIONS = 'mentionsGraph',
    COMMUNITY = 'communityGraph',
}

export const graphTypeItems = [
    { value: GraphType.STANDARD, label: "Standard Graph" },
    { value: GraphType.MENTIONS, label: "Mentions Graph" },
    { value: GraphType.COMMUNITY, label: "Community Graph" },
];