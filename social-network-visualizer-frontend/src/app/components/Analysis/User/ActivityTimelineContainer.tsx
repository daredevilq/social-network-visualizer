import {Bar} from "react-chartjs-2";

export function ActivityTimelineContainer({userActivity, chartData}: { userActivity: any, chartData: any}) {
    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">Activity
                Timeline</h2>

            {userActivity ? (
                <div className="h-80">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    mode: 'index',
                                    intersect: false,
                                    backgroundColor: 'rgba(50, 50, 63, 0.9)',
                                    titleColor: 'rgba(255, 255, 255, 0.9)',
                                    bodyColor: 'rgba(255, 255, 255, 0.9)',
                                    borderColor: 'rgba(92, 55, 230, 0.5)',
                                    borderWidth: 1,
                                },
                            },
                            scales: {
                                x: {
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    ticks: {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    },
                                },
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    ticks: {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    },
                                },
                            },
                        }}
                    />
                </div>
            ) : (
                <p className="text-gray-400">No activity data available.</p>
            )}
        </div>
    )
}