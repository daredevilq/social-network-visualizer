'use client';


import {useState} from "react";
import {useProject} from "@/app/context/ProjectContext";
import { useRouter } from 'next/navigation';

export default function FunctionsContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [source, setSource] = useState("");
    const [target, setTarget] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {setShortestPath} = useProject();
    const router = useRouter();

    const handleSearch = () => {
        if (!source || !target) {
            setShortestPath([]);
            return;
        }

        setIsLoading(true);

        fetch(`http://localhost:8080/author/shortestPath/${source}?target=${target}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setShortestPath(data);
            })
            .catch((err) => console.error("Fetch error:", err))
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="h-full w-full box-border flex flex-col space-y-8 text-white rounded-lg shadow-md">
            <div className="min-h-[40px] w-full border-b-2 border-white flex items-center py-2">
                <h1 className="text-2xl font-bold">Functions</h1>
            </div>
            <div className="w-full">
                <div className="flex flex-col w-full">
                    <button
                        className="flex items-center pl-[5%] py-2 border-b border-[#D3D3D3] cursor-pointer w-full hover:text-[#7140F4]"
                        onClick={() => router.push('/community-analysis')}
                    >
                        <span>Community analysis</span>
                    </button>
                </div>
            </div>
            <div className="w-full">
                <div className="flex flex-col w-full">
                    <button
                        className="flex items-center pl-[5%] py-2 border-b border-[#D3D3D3] cursor-pointer w-full hover:text-[#7140F4]"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>Find the best path between users</span>
                    </button>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="w-9/10 p-3 bg-transparent backdrop-blur-lg border border-white/30 bg-black/50 rounded-md">
                        <h3 className="text-l text-center font-medium mb-1">
                            Choose source and target for shortest path
                        </h3>
                        <h4 className="text-l text-center mb-2">
                            I don't know where it should be placed. We have to fix it somehow ;/
                        </h4>
                        <div className="flex flex-col md:flex-row gap-2 items-center justify-center">
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    placeholder="RealMadrid"
                                    className="px-2 py-1 text-m rounded-md border border-white/30 bg-black/20 text-white w-full"
                                />
                                <input
                                    type="text"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    placeholder="FIFACWC"
                                    className="px-2 py-1 text-m rounded-md border border-white/30 bg-black/20 text-white w-full"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="h-8 px-3 py-1 text-sm rounded-md bg-transparent border border-white/30 text-white cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:border-white/50"
                            >
                                {isLoading ? "..." : "Show"}
                            </button>
                        </div>
                        <h5 className="text-xs text-center opacity-80 mt-2">
                            Empty fields display standard graph
                        </h5>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-1 right-1 text-white text-lg font-bold"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}