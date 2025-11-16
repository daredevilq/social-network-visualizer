import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
  if (!chartArea) {
    return 'rgba(92, 55, 230, 0.1)';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, 'rgba(92, 55, 230, 0.01)');
  gradient.addColorStop(0.8, 'rgba(92, 55, 230, 0.4)');
  gradient.addColorStop(1, 'rgba(92, 55, 230, 0.6)');
  return gradient;
};

export default function ActivityTimelineContainer({ userActivity, chartData }: { userActivity: any; chartData: any }) {
  const lineChartData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset: any) => ({
      ...dataset,
      fill: true,
      backgroundColor: (context: any) => {
        const { ctx, chartArea } = context.chart;
        return getGradient(ctx, chartArea);
      },
      borderColor: 'rgba(92, 55, 230, 1)',
      borderWidth: 3,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: 'rgba(92, 55, 230, 1)',
      pointBorderColor: 'rgba(255, 255, 255, 1)',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
      pointHoverBorderColor: 'rgba(92, 55, 230, 1)',
      pointHoverBorderWidth: 2,
    })),
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(50, 50, 63, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(92, 55, 230, 0.5)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg border border-gray-700/50">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">Activity Timeline</h2>

      {userActivity ? (
        <div className="h-80">
          <Line data={lineChartData} options={commonOptions} />
        </div>
      ) : (
        <p className="text-gray-400">No activity data available.</p>
      )}
    </div>
  );
}
