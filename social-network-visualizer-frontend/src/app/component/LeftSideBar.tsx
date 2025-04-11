'use client';

interface LeftSidebarProps {
    isOpen: boolean;
    selectedGraph: string;
    setSelectedGraph: (graph: string) => void;
}

export default function LeftSidebar({isOpen, selectedGraph, setSelectedGraph}: LeftSidebarProps) {
    return (
        <div
            className={`fixed top-0 left-[3vw] h-screen w-full sm:w-80 bg-gray-800 text-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{backgroundColor: '#262631'}}
        >
            <div className="p-6 h-full flex flex-col space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-gray-600/60">
                    <h1 className="text-2xl font-bold text-white">Graph Type</h1>
                </div>

                <div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-300">
                            Current visualization: <span
                            className="font-semibold">{selectedGraph.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <select
                            value={selectedGraph}
                            onChange={(e) => setSelectedGraph(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
                        >
                            <option value="standardGraph">Standard Graph</option>
                            <option value="mentionsGraph">Mentions Graph</option>
                            <option value="degreeCentralityGraph">Degree Centrality Graph</option>
                            <option value="communityGraph">Community Graph</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}