'use client';

interface GraphContentProps {
    selectedGraph: string;
    setSelectedGraph: (graph: string) => void;
}


export default function GraphTypeContent({ selectedGraph, setSelectedGraph }: GraphContentProps) {
    return (
        <div className="relative h-full flex flex-col text-white px-4 pt-4">
            <h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">Graph Type</h1>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-700">
                {[
                    { value: "standardGraph", label: "Standard Graph" },
                    { value: "mentionsGraph", label: "Mentions Graph" },
                    { value: "degreeCentralityGraph", label: "Degree Centrality Graph" },
                    { value: "communityGraph", label: "Community Graph" },
                ].map((item) => (
                    <div key={item.value} className="py-3">
                        <button
                            onClick={() => setSelectedGraph(item.value)}
                            disabled={selectedGraph === item.value}
                            className={`w-full text-left flex items-center gap-2 transition-colors
                            ${selectedGraph === item.value
                                ? 'text-[#7140F4] font-semibold'
                                : 'text-white hover:text-[#7140F4]'}`}
                        >
                            <span className="truncate">{item.label}</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

}




