'use client'
import {useEffect, useMemo, useState} from 'react'
import {Bar} from 'react-chartjs-2'
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from 'chart.js'
import {useProject} from "@/app/context/ProjectContext";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface UserActivity {
    [month: string]: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/';
const CHART_BACKGROUND_COLOR = 'rgba(92, 55, 230, 0.6)';
const CHART_BORDER_COLOR = 'rgba(92, 55, 230, 1)';

export default function RightSidebar() {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const {isSidebarOpen, setIsSidebarOpen, selectedUserName} = useProject();

    useEffect(() => {
        if (!isSidebarOpen || !selectedUserName) return;
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const userDataRes = await fetch(`${API_BASE_URL}author/${selectedUserName}`)
                const data = await userDataRes.json()
                setUserData(data)

                const activityRes = await fetch(`${API_BASE_URL}author/activity/${selectedUserName}`)
                const activity = await activityRes.json()
                setUserActivity(activity)
            } catch (err) {
                setError('Failed to load user data. Please try again later.');
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData()
    }, [isSidebarOpen, selectedUserName])

    const onClose = () => {
        setIsSidebarOpen(false)
    }

    const chartData = useMemo(() => {
        if (!userActivity) {
            return {
                labels: [],
                datasets: [],
            };
        }

        return {
            labels: Object.keys(userActivity),
            datasets: [
                {
                    label: 'User Activity',
                    data: Object.values(userActivity),
                    backgroundColor: CHART_BACKGROUND_COLOR,
                    borderColor: CHART_BORDER_COLOR,
                    borderWidth: 1,
                },
            ],
        };
    }, [userActivity]);

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 shadow-lg z-40 transform transition-transform duration-300 ease-in-out rounded-l-xl ${
                isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            } border-l-[1px] border-[#FAFAFA] rounded-tr-2xl rounded-br-2xl bg-[#262631]`}
        >
            <div className="p-6 h-full flex flex-col overflow-y-auto text-white space-y-6">
                <div className="flex items-center justify-between border-b border-gray-600 pb-4">
                    <h1 className="text-2xl font-bold">{selectedUserName}</h1>
                    <button
                        onClick={onClose}
                        className="p-2 bg-[#7140F4] text-white rounded-full shadow-md hover:bg-[#5c32c3] transition-colors"
                        aria-label="Close sidebar"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-600 text-white rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold mb-2">User Details:</h3>
                    <hr className="border-gray-500 mb-4"/>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-600 rounded animate-pulse"/>
                            ))}
                        </div>
                    ) : userData ? (
                        <ul className="space-y-2 text-sm">
                            <li><span className="font-semibold">Date of first Tweet:</span> {userData.dateOfFirstTweet}
                            </li>
                            <li><span className="font-semibold">Tweets Count:</span> {userData.tweetsCount}</li>
                            <li><span className="font-semibold">Retweets Count:</span> {userData.retweetsCount}</li>
                            <li><span className="font-semibold">Replies Count:</span> {userData.repliesCount}</li>
                            <li><span className="font-semibold">Average Likes Count:</span> {userData.averageLikesCount}
                            </li>
                            <li><span
                                className="font-semibold">Average Replies Count:</span> {userData.averageRepliesCount}
                            </li>
                            <li><span
                                className="font-semibold">Average Retweets Count:</span> {userData.averageRetweetsCount}
                            </li>
                        </ul>
                    ) : (
                        <p>No user data available.</p>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">User Activity:</h3>
                    <hr className="border-gray-500 mb-4"/>
                    {loading ? (
                        <div className="h-64 bg-gray-600 rounded animate-pulse"/>
                    ) : userActivity ? (
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'User Activity over Time',
                                    },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Months',
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Tweets Count',
                                        },
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p>No activity data available.</p>
                    )}
                </div>

                <div className="mt-auto">
                    <hr className="border-gray-500 mb-4"/>
                    <a
                        href={`/tweet-analysis/${selectedUserName}`}
                        className="w-full inline-block text-center px-4 py-2 bg-[#7140F4] text-white rounded-md hover:bg-[#5c32c3] transition-colors"
                    >
                        View Tweet Analysis
                    </a>
                </div>

            </div>
        </div>
    );
}
