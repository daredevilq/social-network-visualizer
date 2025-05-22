"use client";
import dynamic from "next/dynamic";
import {
    Chart as ChartJS, LineElement, PointElement,
    LinearScale, CategoryScale, Tooltip
} from "chart.js";
import { ActivityPoint } from "@/app/interface/ActivityPoint";
import React from "react";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const Line = dynamic(() => import("react-chartjs-2").then(m => m.Line), { ssr: false });

export default function ActivityChart({ data }: { data: ActivityPoint[] }) {
    if (data.length < 2) return null;

    const chartData = {
        labels: data.map(d => d.day),
        datasets: [{
            data: data.map(d => d.posts),
            borderColor: "#7140F4",
            borderWidth: 2,
            pointRadius: 0,
            tension: .3,
        }],
    };

    const chartOpts = {
        maintainAspectRatio: false,
        interaction: { mode: "index" as const, intersect: false },
        plugins: {
            legend:  { display: false },
            tooltip: {
                backgroundColor: "#1B1B25",
                borderColor: "#7140F4",
                borderWidth: 1,
                padding: 8,
                displayColors: false,
                callbacks: {
                    title:  (ctx: any[]) => ctx[0].label,
                    label:  (ctx: any)  => `Posts: ${ctx.parsed.y}`,
                },
            },
        },
        scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
    };

    return (
        <div className="relative w-full h-24 pt-2">
            <Line data={chartData} options={chartOpts} />
        </div>
    );
}
