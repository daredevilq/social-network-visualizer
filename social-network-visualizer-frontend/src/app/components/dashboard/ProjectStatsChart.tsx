import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
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
            <div className="bg-[#32323F] rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Project Overview
                </h2>
                <p className="text-gray-400">No project data available.</p>
            </div>
        );
    }

    const data = {
        labels: ['Tweets', 'Users', 'Hashtags'],
        datasets: [
            {
                data: [projectData.tweetsCount, projectData.usersCount, projectData.hashtagsCount],
                backgroundColor: [
                    'rgba(127, 90, 255, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(233, 30, 99, 0.8)',
                ],
                borderColor: [
                    'rgba(127, 90, 255, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(233, 30, 99, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(50, 50, 63, 0.9)',
                titleColor: 'rgba(255, 255, 255, 0.9)',
                bodyColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(92, 55, 230, 0.5)',
                borderWidth: 1,
            },
        },
    };

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Project Overview
            </h2>
            <div className="h-80">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}
