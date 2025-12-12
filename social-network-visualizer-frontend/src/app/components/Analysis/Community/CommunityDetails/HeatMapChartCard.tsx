import { Grid } from 'lucide-react';
import React from 'react';
import HeatmapChart from './HeatMapChart';
import { ActivityHeatmap } from '@/app/interface/ActivityHeatmap';

export default function HeatMapChartCard({ heat }: { heat: ActivityHeatmap[] }) {
  const hasData = heat && heat.length > 0;
  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <Grid className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Activity Heatmap</h2>
      </div>

      <div className="flex-1 w-full min-h-[350px] relative">
        {hasData ? (
          <HeatmapChart data={heat} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 absolute inset-0">
            <Grid className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm">No heatmap data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
