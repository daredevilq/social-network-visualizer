'use client';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  ChartOptions,
  ScriptableContext,
} from 'chart.js';
import { ActivityPoint } from '@/app/interface/ActivityPoint';
import React from 'react';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const Line = dynamic(() => import('react-chartjs-2').then((m) => m.Line), {
  ssr: false,
});

export default function ActivityChart({ data }: { data: ActivityPoint[] }) {
  if (data.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Not enough data to display the chart.</div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: 'Posts',
        data: data.map((d) => d.posts),
        borderColor: '#7140F4',
        borderWidth: 3,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(113, 64, 244, 0.5)');
          gradient.addColorStop(1, 'rgba(113, 64, 244, 0.0)');
          return gradient;
        },
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#7140F4',
        pointHoverBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const chartOpts: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
          label: (ctx) => `Posts: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11, family: "'Inter', sans-serif" },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: '#6B7280',
          font: { size: 10 },
          padding: 8,
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={chartOpts} />
    </div>
  );
}
