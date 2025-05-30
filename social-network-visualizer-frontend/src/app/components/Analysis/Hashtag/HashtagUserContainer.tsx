import {Calendar, Hash, MessageCircle, TrendingUp, Users} from "lucide-react";

const mockHashtagStats = {
    totalTweets: 12847,
    totalUsers: 3421,
    avgTweetsPerDay: 245,
    peakDay: "2024-03-15",
    sentiment: "positive",
    growth: "+15.3%"
};

export default function HashtagUsersContainer() {
    return (
        <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Hash className="mr-2 text-[#7140F4]"/>
                Hashtag Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#363A4D] rounded-lg border border-gray-600">
                    <MessageCircle className="mx-auto mb-2 text-[#7140F4]" size={24}/>
                    <div className="text-2xl font-bold text-white">{mockHashtagStats.totalTweets.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Tweets</div>
                </div>

                <div className="text-center p-4 bg-[#363A4D] rounded-lg border border-gray-600">
                    <Users className="mx-auto mb-2 text-green-400" size={24}/>
                    <div className="text-2xl font-bold text-white">{mockHashtagStats.totalUsers.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Unique Users</div>
                </div>

                <div className="text-center p-4 bg-[#363A4D] rounded-lg border border-gray-600">
                    <Calendar className="mx-auto mb-2 text-blue-400" size={24}/>
                    <div className="text-2xl font-bold text-white">{mockHashtagStats.avgTweetsPerDay}</div>
                    <div className="text-sm text-gray-400">Avg/Day</div>
                </div>

                <div className="text-center p-4 bg-[#363A4D] rounded-lg border border-gray-600">
                    <TrendingUp className="mx-auto mb-2 text-orange-400" size={24}/>
                    <div className="text-2xl font-bold text-white">{mockHashtagStats.growth}</div>
                    <div className="text-sm text-gray-400">Growth</div>
                </div>
            </div>
        </div>
    );
};