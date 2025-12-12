import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartEvent,
  ActiveElement,
  Chart,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartColumnDecreasing } from 'lucide-react';
import { useRouter } from 'next/navigation';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface HashtagActivity {
  name: string;
  frequency: number;
}

interface HashtagActivityProps {
  data: HashtagActivity[];
}

export function HashtagActivityChartContainer({ data }: HashtagActivityProps) {
  const router = useRouter();
  const hasData = Array.isArray(data) && data.length > 0;

  const chartData: ChartData<'bar'> = {
    labels: hasData ? data.map((item) => item.name) : [],
    datasets: [
      {
        label: 'Frequency',
        data: hasData ? data.map((item) => item.frequency) : [],
        backgroundColor: 'rgba(113, 64, 244, 0.85)',
        hoverBackgroundColor: 'rgba(113, 64, 244, 1)',
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 40,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#151521',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E2E5',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        border: {
          display: false,
          dash: [4, 4],
        },
        ticks: {
          color: '#6B7280',
          font: { size: 10 },
          padding: 8,
        },
      },
    },
    onClick(event: ChartEvent, elements: ActiveElement[], chart: Chart) {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const clickedItem = data[elementIndex];
        router.push(`/hashtag-details/${clickedItem.name}`);
      }
    },
    onHover: (event, elements) => {
      const canvas = event.native?.target as HTMLCanvasElement;
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
  };

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <ChartColumnDecreasing className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Hashtag Usage</h2>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        {hasData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ChartColumnDecreasing className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm">No activity data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
