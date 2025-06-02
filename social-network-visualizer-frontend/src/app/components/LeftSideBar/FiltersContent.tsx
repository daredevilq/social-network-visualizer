'use client';

import { useProject } from "@/app/context/ProjectContext";
import { useEffect, useRef, useState } from "react";
import { Network } from "lucide-react";
import { API_BASE_URL } from '@/app/configuration/urlConfig';

interface GraphType {
    value: string;
    label: string;
}

export default function FiltersContent() {
    const {
        graphRelationType,
        updateGraphType,
        runWithLoading,
        loading,
    } = useProject();

    const [types, setTypes] = useState<GraphType[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    const showStatus = (msg: string) => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setStatus(msg);
        hideTimer.current = setTimeout(() => setStatus(null), 3000);
    };

    const refreshTypes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/graph/types`);
            const data = await res.json();
            setTypes(data);
        } catch (err) {
            console.error("Failed to fetch graph types", err);
        }
    };

    const selectGraphType = async (type: GraphType) => {
        await runWithLoading(async () => {
            const res = await fetch(`${API_BASE_URL}/graph/${type.value}`, { method: "POST" });
            if (!res.ok) throw new Error("Graph computation failed");

            showStatus(`Relations "${type.label}" recomputed.`);

            await updateGraphType(type.value);
        });
    };

    useEffect(() => { refreshTypes(); }, []);

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

            {status && !loading && (
                <p className="text-center text-sm text-[#7140F4] py-2">{status}</p>
            )}
        </div>
    );
}
