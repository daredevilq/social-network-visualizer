import { ChartData } from 'chart.js';
import BaseActivityTimeline from '@/app/components/Analysis/BaseActivityTimeline';

export interface HashtagActivity {
  [month: string]: number;
}

interface HashtagActivityTimelineProps {
  hashtagActivity: HashtagActivity | null;
  chartData: ChartData<'line'>;
}

export default function HashtagActivityTimelineContainer({ hashtagActivity, chartData }: HashtagActivityTimelineProps) {
  return <BaseActivityTimeline title="Activity Timeline" activityData={hashtagActivity} chartData={chartData} />;
}
