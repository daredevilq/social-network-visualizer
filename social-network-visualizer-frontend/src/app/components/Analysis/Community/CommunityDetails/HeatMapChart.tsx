'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend, ScriptableContext } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart } from 'react-chartjs-2';
import chroma from 'chroma-js';
import React from 'react';
import { ActivityHeatmap } from '@/app/interface/ActivityHeatmap';

ChartJS.register(MatrixController, MatrixElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function HeatmapChart({ data }: { data: ActivityHeatmap[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const safeData = Array.isArray(data) ? data : [];
  const maxPosts = safeData.length > 0 ? Math.max(...safeData.map((c) => c.posts)) : 0;

  const matrixData = safeData.map((c) => ({
    x: c.hour,
    y: daysLabels[c.dayOfWeek - 1],
    v: c.posts,
  }));

  const scale = chroma.scale(['#3D3D4E', '#7140F4', '#A78BFA']).mode('lch');

  const chartData = {
    datasets: [
      {
        label: 'posts',
        data: matrixData,
        backgroundColor: (ctx: ScriptableContext<'matrix'>) => {
          const v = (ctx.raw as any)?.v;
          if (v == null || isNaN(v) || v === 0) return 'rgba(255, 255, 255, 0.02)';
          return scale(v / maxPosts).hex();
        },
        width: (ctx: ScriptableContext<'matrix'>) => {
          const area = ctx.chart.chartArea;
          return area ? area.width / hours.length - 2 : 0;
        },
        height: (ctx: ScriptableContext<'matrix'>) => {
          const area = ctx.chart.chartArea;
          return area ? area.height / daysLabels.length - 2 : 0;
        },
        borderWidth: 0,
        borderRadius: 3,
        hoverBackgroundColor: '#FFFFFF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const item = context[0].raw;
            return `${item.y} | ${item.x}:00`;
          },
          label: (context: any) => {
            const v = context.raw.v;
            return `${v} post${v !== 1 ? 's' : ''}`;
          },
        },
        backgroundColor: '#151521',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E2E5',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        labels: hours,
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10, family: "'Inter', sans-serif" },
          autoSkip: false,
          maxRotation: 0,
        },
        title: {
          display: true,
          text: 'Hour (UTC)',
          color: '#6B7280',
          font: { size: 10, weight: '500' },
          padding: { top: 10 },
        },
      },
      y: {
        type: 'category' as const,
        labels: daysLabels,
        offset: true,
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11, weight: '500', family: "'Inter', sans-serif" },
        },
        reverse: true,
      },
    },
  };

  return (
    <div className="w-full h-full pb-2">
      <Chart type="matrix" data={chartData} options={options as any} />
    </div>
  );
}
