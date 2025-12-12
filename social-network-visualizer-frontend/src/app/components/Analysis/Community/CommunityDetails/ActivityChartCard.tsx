'use client';

import { LineChart } from 'lucide-react';
import { ActivityPoint } from '@/app/interface/ActivityPoint';
import ActivityChart from '@/app/components/Analysis/Community/CommunityOverview/ActivityChart';

export default function ActivityChartCard({ activity }: { activity: ActivityPoint[] }) {
  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <LineChart className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Activity Over Time</h2>
      </div>

      <div className="flex-1 min-h-[300px] w-full relative">
        {activity && activity.length > 0 ? (
          <ActivityChart data={activity} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 absolute inset-0">
            <LineChart className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm">No activity data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
