'use client';

import {useProject} from "@/app/context/ProjectContext";
import {useEffect, useState} from "react";
import {Network} from "lucide-react";
import {API_BASE_URL} from '@/app/configuration/urlConfig';
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";

interface GraphType {
    value: string;
    label: string;
}

export default function FiltersContent() {
    const {
        graphRelationType,
        updateGraphType,
        runWithLoading,
    } = useProject();
    const [types, setTypes] = useState<GraphType[]>([]);
    const { showNotification } = useNotification();

    const refreshTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/graph/types`);
            if (!res.ok) throw new Error("Failed to fetch graph types");
            const data = await res.json();
            setTypes(data);
        } catch (err: any) {
            showNotification(`Error fetching graph types: ${err.message}`, BannerType.ERROR);
        }
    };

    const selectGraphType = async (type: GraphType) => {
        await runWithLoading(async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/graph/${type.value}`, { method: "POST" });
                if (!res.ok) throw new Error("Graph computation failed");

                await updateGraphType(type.value);
                showNotification(`Relations "${type.label}" recomputed.`, BannerType.INFO);
            } catch (err: any) {
                showNotification(`Error updating graph: ${err.message || err}`, BannerType.ERROR);
            }
        });
    };

    useEffect(() => {
        refreshTypes();
    }, []);

    return (
        <div className="relative h-full flex flex-col text-white px-4 pt-4">
            <h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">Relations Types</h1>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-700">
                {types.map((type) => (
                    <div key={type.value} className="py-3">
                        <button
                            disabled={graphRelationType === type.value}
                            onClick={() => selectGraphType(type)}
                            className={`flex items-center gap-2 w-full text-left transition-colors
                                ${graphRelationType === type.value
                                ? 'text-[#7140F4] font-semibold'
                                : 'text-white hover:text-[#7140F4] cursor-pointer'
                            }`}
                        >
                            <Network className="w-4 h-4 shrink-0" />
                            <span className="truncate">{type.label}</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
