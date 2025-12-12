'use client';

import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SizeCount } from '@/app/interface/CommunityOverview';

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarController, BarElement, Tooltip, Legend);

export default function HistogramChart({ data }: { data: SizeCount[] }) {
  const safeData = Array.isArray(data) ? data : [];
  const sorted = [...safeData].sort((a, b) => a.communitySize - b.communitySize);

  const chartData: ChartData<'bar'> = {
    labels: sorted.map((d) => d.communitySize.toString()),
    datasets: [
      {
        label: 'Communities count',
        data: sorted.map((d) => d.memberCount),
        backgroundColor: 'rgba(113, 64, 244, 0.85)',
        hoverBackgroundColor: '#7140F4',
        borderRadius: 4,
        barPercentage: 0.95,
        categoryPercentage: 0.95,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#151521',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E2E5',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => `Size bucket: ${items[0].label}`,
          label: (item) => `${Number(item.raw).toLocaleString()} communities`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11, family: "'Inter', sans-serif" },
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        title: {
          display: true,
          text: 'Community Size (Users)',
          color: '#6B7280',
          font: { size: 12, weight: 500 },
          padding: { top: 10 },
        },
        border: { display: false },
      },
      y: {
        type: 'logarithmic',
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: '#6B7280',
          font: { size: 10 },
          padding: 8,
          callback: (value) => Number(value).toLocaleString('en-US'),
          maxTicksLimit: 6,
        },
        title: {
          display: true,
          text: 'Count (Log Scale)',
          color: '#6B7280',
          font: { size: 12, weight: 500 },
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
