'use client';

import HistogramChart from './HistogramChart';
import { SizeCount } from '@/app/interface/CommunityOverview';
import { BarChartBig } from 'lucide-react';

export default function HistogramChartCard({ histogram }: { histogram: SizeCount[] }) {
  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg mb-8 w-full">
      <div className="flex items-center mb-6 border-b border-gray-600 pb-2">
        <BarChartBig className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Community size distribution histogram</h2>
      </div>

      {histogram.length ? <HistogramChart data={histogram} /> : <p className="text-center text-gray-400">no histogram data</p>}
    </div>
  );
}
