'use client'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {Bar} from 'react-chartjs-2'
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from 'chart.js'
import {useProject} from "@/app/context/ProjectContext"

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
const CHART_BACKGROUND_COLOR = 'rgba(92, 55, 230, 0.8)';
const CHART_BORDER_COLOR = 'rgba(92, 55, 230, 1)';

export default function UserDetailsContainer({username}: { username: string }) {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null)
    const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
    const [userMentions, setUserMentions] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const {setSelectedUserName} = useProject();

    useEffect(() => {
        if (!username) {
            router.push('/');
            return;
        }

        setSelectedUserName(username);

        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const userDataRes = await fetch(`${API_BASE_URL}author/${username}`)
                const data = await userDataRes.json()
                setUserData(data)

                const activityRes = await fetch(`${API_BASE_URL}author/activity/${username}`)
                const activity = await activityRes.json()
                setUserActivity(activity)

                const mentionsRes = await fetch(`${API_BASE_URL}author/mentions/${username}`)
                const mentions = await mentionsRes.json()
                setUserMentions(mentions)
            } catch (err) {
                setError('Failed to load user data. Please try again later.');
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData()
    }, [username, router, setSelectedUserName])

    const navigateBack = () => {
        router.back();
    }

    const chartData = {
        labels: userActivity ? Object.keys(userActivity) : [],
        datasets: [
            {
                label: 'User Activity',
                data: userActivity ? Object.values(userActivity) : [],
                backgroundColor: CHART_BACKGROUND_COLOR,
                borderColor: CHART_BORDER_COLOR,
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="w-full min-h-screen bg-[#262631] text-white p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={navigateBack}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back
                    </button>

                    <h1 className="text-3xl font-bold">{username}</h1>

                    <div className="w-24"></div>
                </div>

                {error && (
                    <div className="p-4 bg-red-600 text-white rounded-md mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-6">
                        <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
                        <div className="h-96 bg-gray-700 rounded-md animate-pulse"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">User Profile</h2>

                            {userData ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400">Date of first Tweet</span>
                                        <span className="text-lg">{userData.dateOfFirstTweet}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#3D3D4E] p-4 rounded-lg">
                                            <span className="text-gray-400">Tweets</span>
                                            <div className="text-3xl font-bold">{userData.tweetsCount}</div>
                                        </div>

                                        <div className="bg-[#3D3D4E] p-4 rounded-lg">
                                            <span className="text-gray-400">Retweets</span>
                                            <div className="text-3xl font-bold">{userData.retweetsCount}</div>
                                        </div>

                                        <div className="bg-[#3D3D4E] p-4 rounded-lg">
                                            <span className="text-gray-400">Replies</span>
                                            <div className="text-3xl font-bold">{userData.repliesCount}</div>
                                        </div>

                                        <div className="bg-[#3D3D4E] p-4 rounded-lg">
                                            <span className="text-gray-400">Avg. Likes</span>
                                            <div className="text-3xl font-bold">{userData.averageLikesCount}</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-600">
                                        <h3 className="text-xl mb-3">Engagement Metrics</h3>
                                        <ul className="space-y-2">
                                            <li className="flex justify-between">
                                                <span>Average Replies:</span>
                                                <span className="font-medium">{userData.averageRepliesCount}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Average Retweets:</span>
                                                <span className="font-medium">{userData.averageRetweetsCount}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <p>No user data available.</p>
                            )}
                        </div>

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
                                <p>No activity data available.</p>
                            )}
                        </div>

                        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
                            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">User
                                Connections</h2>

                            {userMentions && userMentions.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {userMentions.map((user, index) => (
                                        <div
                                            key={index}
                                            className="bg-[#3D3D4E] p-4 rounded-lg hover:bg-[#4D4D5E] cursor-pointer transition-colors"
                                            onClick={() => router.push(`/user-details/${user}`)}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full bg-[#7140F4] flex items-center justify-center mb-2">
                                                {user.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="font-medium truncate">{user}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No connection data available.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}