"use client";

import HistogramChart       from "./HistogramChart";
import { SizeCount }        from "@/app/interface/CommunityOverview";

export default function HistogramChartCard({ histogram }: { histogram: SizeCount[] }) {
    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg mb-8 w-full">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">
                Community size distribution histogram
            </h2>

            {histogram.length
                ? <HistogramChart data={histogram}/>
                : <p className="text-center">no histogram data</p>}
        </div>
    );
}
