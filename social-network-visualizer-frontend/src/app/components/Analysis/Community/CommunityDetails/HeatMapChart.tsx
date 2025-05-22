"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { Chart } from "react-chartjs-2";
import chroma from "chroma-js";
import React from "react";
import {ActivityHeatmap} from "@/app/interface/ActivityHeatmap";


ChartJS.register(
    MatrixController,
    MatrixElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

export default function HeatmapChart({ data }: { data: ActivityHeatmap[] }) {
    const hours= Array.from({ length: 24 }, (_, i) => i);  // 0-23
    const daysLabels= ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; // 1-7
    const safeData = Array.isArray(data) ? data : [];
    const maxPosts = safeData.length > 0 ? Math.max(...safeData.map(c => c.posts)) : 0;

    const matrixData = safeData.map(c => ({
        x: c.hour,
        y: daysLabels[c.dayOfWeek - 1],
        v: c.posts,
    }));

    const scale = chroma.scale(["#2A1A63", "#7140F4", "#D2C5FF"]).mode("lch");

    const chartData = {
        datasets: [
            {
                label: "posts",
                data : matrixData,
                backgroundColor: (ctx: any) => {
                    const dataPoint = ctx?.dataset?.data?.[ctx.dataIndex];
                    const v = dataPoint?.v;

                    if (v == null || isNaN(v)) return "rgba(0,0,0,0)";
                    return scale(v / maxPosts).hex();
                },
                width : (ctx: any) => {
                    const area = ctx.chart.chartArea;
                    return area ? area.width  / hours.length   - 1 : 0;
            },
                height: (ctx: any) => {
                    const area = ctx.chart.chartArea;
                    return area ? area.height / daysLabels.length - 1 : 0;},
                borderWidth: 0,
                borderRadius: 2,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { top: 6, bottom: 12 }
        },
        plugins : {
            legend : { display: false },
            tooltip: {
                callbacks: {
                    title: ([t]: any) =>
                        `Day ${t.raw?.y} | Hour ${t.raw?.x}`,
                    label: (t: any) => `${t.raw?.v} posts`,
                },
                backgroundColor: "rgba(50,50,63,0.9)",
                borderColor : "rgba(113,64,244,0.5)",
                borderWidth : 1
            }
        },
        scales: {
            x: {
                type : "category" as const,
                labels: hours,
                offset: true,
                grid : { display: false },
                ticks : { color: "rgba(255,255,255,0.7)" },
                title : {
                    display: true,
                    text : "Hour of day (UTC)",
                    color : "rgba(255,255,255,0.8)",
                    font  : { size: 12 }
                }
            },
            y: {
                type : "category" as const,
                labels: daysLabels,
                offset: true,
                grid : { display: false },
                ticks : { color: "rgba(255,255,255,0.7)" },
                reverse: true,
                title : {
                    display: true,
                    text : "Day of week",
                    color : "rgba(255,255,255,0.8)",
                    font : { size: 12 }
                }
            }
        }
    };

    return (
        <div className="h-96 w-full">
            <Chart type="matrix" data={chartData} options={options as any} />
        </div>
    );
}
