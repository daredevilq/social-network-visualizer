'use server'

import {GraphType} from "@/app/interface/GraphType";

let projectName: string | null = null;
let graphType: string = "mentions";
let graphUiType: GraphType = GraphType.STANDARD;

export async function setProjectName(name: string): Promise<void> {
    projectName = name;
}

export async function getProjectName(): Promise<string | null> {
    return projectName;
}

export async function resetProjectName(): Promise<void> {
    projectName = null;
}

export async function getGraphType(): Promise<string> {
    return graphType;
}

export async function setGraphType(type: string): Promise<void> {
    graphType = type;
}

export async function getGraphUiType(): Promise<GraphType> {
    return graphUiType;
}

export async function setGraphUiType(type: GraphType): Promise<void> {
    graphUiType = type;
}