import { ChartData } from 'chart.js';
import BaseActivityTimeline from '@/app/components/Analysis/BaseActivityTimeline';

interface ActivityTimelineProps {
  userActivity: any;
  chartData: ChartData<'line'>;
}

export default function ActivityTimelineContainer({ userActivity, chartData }: ActivityTimelineProps) {
  return <BaseActivityTimeline title="Activity Timeline" activityData={userActivity} chartData={chartData} />;
}
