import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend, ChartEvent, ActiveElement, Chart,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { ChartColumnDecreasing  } from "lucide-react";
import {useRouter} from "next/navigation";

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

    const chartData: ChartData<"bar"> = {
        labels: hasData ? data.map((item) => item.name) : [],
        datasets: [
            {
                label: "Frequency",
                data: hasData ? data.map((item) => item.frequency) : [],
                backgroundColor: "rgba(113, 64, 244, 0.7)",
                borderRadius: 6,
                barThickness: 24,
            },
        ],
    };

    const chartOptions: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: "index",
                intersect: false,
                backgroundColor: "rgba(50, 50, 63, 0.9)",
                titleColor: "rgba(255, 255, 255, 0.9)",
                bodyColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "rgba(92, 55, 230, 0.5)",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "rgba(255, 255, 255, 0.7)" },
            },
            y: {
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "rgba(255, 255, 255, 0.7)" },
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
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <ChartColumnDecreasing className="w-5 h-5 mr-2" />
                Hashtag Usage
            </h2>

            {hasData ? (
                <div className="h-80">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            ) : (
                <p className="text-gray-400">No activity data available.</p>
            )}
        </div>
    );
}
