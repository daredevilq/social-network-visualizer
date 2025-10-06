import { GraphLink } from "@types/GraphTypes";

export function getSourceId(link: GraphLink): string {
    if (typeof link.source === "object" && link.source?.id) {
        return String(link.source.id);
    }
    return String(link.source);
}

export function getTargetId(link: GraphLink): string {
    if (typeof link.target === "object" && link.target?.id) {
        return String(link.target.id);
    }
    return String(link.target);
}
