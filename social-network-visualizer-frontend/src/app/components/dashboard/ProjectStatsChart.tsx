import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectData {
  tweetsCount: number;
  usersCount: number;
  hashtagsCount: number;
}

interface Props {
  projectData: ProjectData | null;
}

export function ProjectStatsChart({ projectData }: Props) {
  if (!projectData) {
    return (
      <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg flex flex-col h-full">
        <div className="flex items-center mb-6 border-b border-white/10 pb-4">
          <PieChart className="w-5 h-5 mr-2 text-[#7140F4]" />
          <h2 className="text-xl font-bold text-white">Project Overview</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-sm">No project data available.</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: ['Tweets', 'Authors', 'Hashtags'],
    datasets: [
      {
        data: [projectData.tweetsCount, projectData.usersCount, projectData.hashtagsCount],
        backgroundColor: ['rgba(113, 64, 244, 0.9)', 'rgba(59, 130, 246, 0.9)', 'rgba(20, 184, 166, 0.9)'],
        borderColor: '#2A2D3D',
        borderWidth: 4,
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E2E2E5',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: '#151521',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E2E5',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg flex flex-col h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <PieChart className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Project Overview</h2>
      </div>

      <div className="flex-1 min-h-[300px] relative">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
