


export function UserProfileContainer({userData, animatedStats}: { userData: any, animatedStats: any}) {
    return (
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
                            <div className="text-3xl font-bold">{animatedStats.tweetsCount}</div>
                        </div>

                        <div className="bg-[#3D3D4E] p-4 rounded-lg">
                            <span className="text-gray-400">Retweets</span>
                            <div className="text-3xl font-bold">{animatedStats.retweetsCount}</div>
                        </div>

                        <div className="bg-[#3D3D4E] p-4 rounded-lg">
                            <span className="text-gray-400">Replies</span>
                            <div className="text-3xl font-bold">{animatedStats.repliesCount}</div>
                        </div>

                        <div className="bg-[#3D3D4E] p-4 rounded-lg">
                            <span className="text-gray-400">Avg. Likes</span>
                            <div className="text-3xl font-bold">{animatedStats.averageLikesCount}</div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-600">
                        <h3 className="text-xl mb-3">Engagement Metrics</h3>
                        <ul className="space-y-2">
                            <li className="flex justify-between">
                                <span>Average Replies:</span>
                                <span className="font-medium">{animatedStats.averageRepliesCount}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Average Retweets:</span>
                                <span
                                    className="font-medium">{animatedStats.averageRetweetsCount}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            ) : (
                <p className="text-gray-400">No user data available.</p>
            )}
        </div>
    )
}