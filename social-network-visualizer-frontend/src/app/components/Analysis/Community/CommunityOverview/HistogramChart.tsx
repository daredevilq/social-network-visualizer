"use client";

import {
    BarController, BarElement,
    CategoryScale, Chart as ChartJS,
    Legend, LinearScale, LogarithmicScale, Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { SizeCount } from "@/app/interface/CommunityOverview";

ChartJS.register(
    CategoryScale, LinearScale, LogarithmicScale,
    BarController, BarElement, Tooltip, Legend
);

export default function HistogramChart({ data }: { data: SizeCount[] }) {
    const sorted = [...data].sort((a, b) => a.communitySize - b.communitySize);

    const chartData = {
        labels: sorted.map(d => d.communitySize.toString()),
        datasets: [
            {
                label: "liczba community",
                data:  sorted.map(d => d.memberCount),
                backgroundColor: "#7140F4"
            }
        ]
    };

    return (
        <div className="h-64">
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: "index", intersect: false }
                    },
                    scales: {
                        x: {
                            grid: { color: "rgba(255,255,255,0.1)" },
                            title: {
                                display: true,
                                text: "Community size",
                                color: "rgba(255,255,255,0.6)",
                                font: { size: 12 }
                            }
                        },
                        y: {
                            type: "logarithmic",
                            beginAtZero: false,
                            grid: {
                                drawTicks: true,
                                // @ts-expect-error
                                drawBorder: false,
                                color: (ctx) =>
                                    ctx.tick.value % 1 === 0
                                        ? "rgba(255,255,255,0.1)"
                                        : "transparent"
                            },
                            ticks: {
                                callback: (v) => Number(v).toLocaleString("pl-PL"),
                                maxTicksLimit: 6
                            },
                            title: {
                                display: true,
                                text: "Number of communities",
                                color: "rgba(255,255,255,0.6)",
                                font: { size: 12 }
                            }
                        }
                    }
                }}
            />
        </div>
    );

}
