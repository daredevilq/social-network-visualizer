export enum GraphType {
    STANDARD = 'standardGraph',
    COMMUNITY = 'communityGraph',
}

export const graphTypeItems = [
    { value: GraphType.STANDARD, label: "Standard Graph" },
    { value: GraphType.COMMUNITY, label: "Community Graph" },
];