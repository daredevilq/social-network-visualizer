'use client';

interface GraphContentProps {
    selectedGraph: string;
    setSelectedGraph: (graph: string) => void;
}


export default function GraphTypeContent({ selectedGraph, setSelectedGraph }: GraphContentProps) {
    return (
        <div className="h-full w-full box-border flex flex-col space-y-8 text-white rounded-lg shadow-md">
            <div className="min-h-[40px] w-full border-b-2 border-white flex items-center py-2">
                <h1 className="text-2xl font-bold">Graph Type</h1>
            </div>
            <div className="space-y-6">
                <div className="mt-4">
                    <p className="text-sm text-gray-300">
                        Current visualization:{" "}
                        <span className="font-semibold">
                            {selectedGraph
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                    </p>
                </div>

                <div className="space-y-2">
                    <select
                        value={selectedGraph}
                        onChange={(e) => setSelectedGraph(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="standardGraph">Standard Graph</option>
                        <option value="mentionsGraph">Mentions Graph</option>
                        <option value="degreeCentralityGraph">Degree Centrality Graph</option>
                        <option value="communityGraph">Community Graph</option>
                    </select>
                </div>
            </div>
        </div>
    );
}




