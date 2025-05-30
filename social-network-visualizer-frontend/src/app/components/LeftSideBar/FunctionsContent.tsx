'use client';

import { useState } from "react";
import { useProject } from "@/app/context/ProjectContext";
import { useRouter } from 'next/navigation';

export default function FunctionsContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [source, setSource] = useState("");
    const [target, setTarget] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setShortestPath } = useProject();
    const router = useRouter();

    const handleSearch = () => {
        if (!source || !target) {
            setShortestPath([]);
            return;
        }

        setIsLoading(true);

        fetch(`http://localhost:8080/author/shortestPath/${source}?target=${target}`)
            .then((res) => res.json())
            .then((data) => setShortestPath(data))
            .catch((err) => console.error("Fetch error:", err))
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="relative h-full flex flex-col text-white px-4 pt-4">
            <h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">Graph Functions</h1>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-700">
                <div className="py-3">
                    <button
                        className="flex items-center gap-2 w-full text-left text-white hover:text-[#7140F4] cursor-pointer transition-colors"
                        onClick={() => router.push('/community-analysis')}
                    >
                        <span>Community analysis</span>
                    </button>
                </div>

                <div className="py-3">
                    <button
                        className="flex items-center gap-2 w-full text-left text-white hover:text-[#7140F4] cursor-pointer transition-colors"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>Find the best path between users</span>
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="w-[90%] md:w-[600px] p-4 bg-black/60 backdrop-blur-md border border-white/20 rounded-md relative">
                        <h3 className="text-lg font-semibold text-center mb-2">
                            Find shortest path
                        </h3>
                        <p className="text-sm text-center text-white/80 mb-4">
                            Provide source and target usernames
                        </p>

                        <div className="flex flex-col md:flex-row gap-2 mb-3">
                            <input
                                type="text"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="RealMadrid"
                                className="px-3 py-2 rounded-md border border-white/30 bg-black/20 text-white w-full"
                            />
                            <input
                                type="text"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="FIFACWC"
                                className="px-3 py-2 rounded-md border border-white/30 bg-black/20 text-white w-full"
                            />
                        </div>

                        <div className="flex justify-center mb-2">
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="h-9 px-4 rounded-md bg-transparent border border-white/30 text-white transition-all disabled:opacity-60 hover:border-white/50"
                            >
                                {isLoading ? "..." : "Show"}
                            </button>
                        </div>

                        <p className="text-xs text-center text-white/60">
                            Leaving fields empty shows the default graph.
                        </p>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-3 text-white text-lg font-bold"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
