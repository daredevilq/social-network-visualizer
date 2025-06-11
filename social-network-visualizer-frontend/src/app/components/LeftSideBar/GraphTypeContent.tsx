'use client';

import {graphTypeItems} from "@/app/interface/GraphType";
import {useProject} from "@/app/context/ProjectContext";
import {setGraphUiType} from "@/app/project-state";


export default function GraphTypeContent() {
    const { selectedGraphType } = useProject();

    return (
        <div className="relative h-full flex flex-col text-white px-4 pt-4">
            <h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">Graph Type</h1>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-700">
                {graphTypeItems.map(({ value, label }) => (
                    <div key={value} className="py-3">
                        <button
                            onClick={async () => {
                                await setGraphUiType(value);
                                window.location.href = "/";
                            }}
                            disabled={selectedGraphType === value}
                            className={`w-full text-left transition-colors ${
                                selectedGraphType === value
                                    ? "text-[#7140F4] font-semibold"
                                    : "text-white hover:text-[#7140F4] cursor-pointer"
                            }`}
                        >
                            {label}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}




