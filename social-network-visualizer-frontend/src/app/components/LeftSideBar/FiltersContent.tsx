"use client";

import { useProject } from "@/app/context/ProjectContext";
import { useEffect, useState } from "react";
import { Network } from "lucide-react";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import { useNotification } from "@/app/context/NotificationProvider";
import { BannerType } from "@/app/components/Popups/Banner";

export default function FiltersContent() {
    const {
        loadedProjectName,
        fetchGraphData,
        selectedRelations,
        setSelectedRelations,
    } = useProject();
    const [types, setTypes] = useState<string[]>([]);
    const [draftRelations, setDraftRelations] =
        useState<string[]>(selectedRelations);
    const { showNotification } = useNotification();

    const refreshTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/config/relation-types`);
            if (!res.ok) throw new Error("Failed to fetch graph types");
            const data = await res.json();
            setTypes(Array.isArray(data) ? data : Object.values(data));
        } catch (err: any) {
            showNotification(
                `Error fetching graph types: ${err.message}`,
                BannerType.ERROR
            );
        }
    };

    const toggle = (rel: string) => {
        setDraftRelations((prev) => {
            const next = prev.includes(rel)
                ? prev.filter((r) => r !== rel)
                : [...prev, rel];
            return next.length ? next : ["MENTIONS"];
        });
    };

    const apply = async () => {
        if (!loadedProjectName) return;
        setSelectedRelations(draftRelations);
        await fetchGraphData({
            projectName: loadedProjectName,
            relationTypes: draftRelations,
            communityId: null,
            nodeLabels: null,
        });
    };

    useEffect(() => {
        refreshTypes();
    }, []);

    useEffect(() => {
        setDraftRelations(selectedRelations);
    }, [selectedRelations]);

    return (
        <div className="relative h-full flex flex-col text-white px-4 pt-4">
            <h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">
                Relations Types
            </h1>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-700 scrollbar-dark">
                {types.map((rel) => (
                    <label
                        key={rel}
                        className="py-3 flex items-center gap-2 cursor-pointer select-none text-white hover:text-[#7140F4] transition-colors"
                    >
                        <input
                            type="checkbox"
                            className="accent-[#7140F4]"
                            checked={draftRelations.includes(rel)}
                            onChange={() => toggle(rel)}
                        />
                        <Network className="w-4 h-4 shrink-0" />
                        <span className="truncate">{rel}</span>
                    </label>
                ))}
            </div>
            <div className="pt-3 border-t border-gray-700">
                <button
                    onClick={apply}
                    disabled={!loadedProjectName}
                    className="w-full py-2 rounded bg-[#7140F4] hover:bg-[#5e2ff0] disabled:opacity-50"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}
