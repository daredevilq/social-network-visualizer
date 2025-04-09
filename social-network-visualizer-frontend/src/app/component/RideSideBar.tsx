'use client'
import {useEffect, useState} from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

export default function RightSidebar({ isOpen, onClose, userName }) {
    const [userData, setUserData] = useState(null)
    const [userActivity, setUserActivity] = useState(null)

    useEffect(() => {
        if (isOpen && userName) {
            const fetchData = async () => {
                try {
                    const res = await fetch(`http://localhost:8080/author/${userName}`)
                    const data = await res.json()
                    setUserData(data)

                    const activityRes = await fetch(`http://localhost:8080/author/activity/${userName}`)
                    const activity = await activityRes.json()
                    setUserActivity(activity)
                } catch (err) {
                    console.error('Error fetching user data:', err)
                }
            }

            fetchData()
        }
    }, [isOpen, userName])

    const chartData = userActivity ? {
        labels: Object.keys(userActivity), 
        datasets: [
            {
                label: 'User Activity',
                data: Object.values(userActivity),
                backgroundColor: 'rgba(92, 55, 230, 0.6)',
                borderColor: 'rgba(92, 55, 230, 1)',
                borderWidth: 1,
            },
        ],
    } : {};

    if (!isOpen) return null

    return (
        <>

            {/* Sidebar z prawej */}
            <div
                className={`fixed top-0 right-0 h-full w-[30vw] max-w-sm shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                } rounded-l-xl`}
                style={{backgroundColor: '#262631'}}
            >
                {/* Zbiorczy padding tutaj */}
                <div className="p-10 h-full flex flex-col overflow-y-auto text-white space-y-10">
                    {/* Nagłówek */}
                    <div className="flex items-center justify-between border-b border-gray-600 pb-4">
                        <h1 className="text-2xl font-bold">{userName}</h1>
                        <div className="fixed top-4 right-4 z-50">
                            <button onClick={onClose} className="p-2 text-white bg-blue-600 rounded-full shadow-md">
                                <span>Hide</span>
                            </button>
                        </div>
                    </div>

                    {/* Szczegóły użytkownika */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">User Details:</h3>
                        <hr className="border-gray-500 mb-4"/>
                        <ul className="space-y-2 text-sm">
                            {userData ? (
                                <>
                                    <li><span className="font-semibold">Date of first Tweet:</span> {userData.dateOfFirstTweet}</li>
                                    <li><span className="font-semibold">Tweets Count:</span> {userData.tweetsCount}</li>
                                    <li><span className="font-semibold">Retweets Count:</span> {userData.retweetsCount}</li>
                                    <li><span className="font-semibold">Replies Count:</span> {userData.repliesCount}</li>
                                    <li><span className="font-semibold">Average Likes Count:</span> {userData.averageLikesCount}</li>
                                    <li><span className="font-semibold">Average Replies Count:</span> {userData.averageRepliesCount}</li>
                                    <li><span className="font-semibold">Average Retweets Count:</span> {userData.averageRetweetsCount}</li>
                                </>
                            ) : (
                                <li>Loading user data...</li>
                            )}
                        </ul>
                    </div>

                    {/* Aktywność użytkownika */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">User activity:</h3>
                        <hr className="border-gray-500 mb-4"/>


                        {userActivity ? (
                            <div>
                                <Bar data={chartData} options={{
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
                                        },
                                    },
                                }} />
                            </div>
                        ) : (
                            <p>Loading activity...</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
