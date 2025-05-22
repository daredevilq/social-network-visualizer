"use client";

import HeatmapChart from "./HeatMapChart";
import {ActivityHeatmap} from "@/app/interface/ActivityHeatmap";

export default function HeatMapChartCard({ heat }: { heat: ActivityHeatmap[] }) {
    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">
                Activity heat-map (24 × 7)
            </h2>
            <HeatmapChart data={heat} />
        </div>
    );
}
