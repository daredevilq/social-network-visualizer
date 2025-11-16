import { Calendar, Globe, Heart, MessageCircle, TrendingUp, Users, Zap } from 'lucide-react';

export interface HashtagProfile {
  name: string;
  totalUsage: number;
  uniqueUsers: number;
  totalLikes: number;
  totalRetweets: number;
  firstUsed: string;
  lastUsed: string;
  totalReplies: number;
  distinctLanguages: number;
}

interface HashtagProfileContainerProps {
  profileData: HashtagProfile | null;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'N/A';
  }
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

export default function HashtagProfileContainer({ profileData }: HashtagProfileContainerProps) {
  if (!profileData) {
    return (
      <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700">
        <div className="h-6 w-1/3 bg-gray-600 rounded-md animate-pulse mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 bg-[#363A4D] rounded-lg border border-gray-600 animate-pulse">
              <div className="h-6 w-1/2 mx-auto mb-2 bg-gray-500 rounded-md"></div>
              <div className="h-4 w-1/3 mx-auto bg-gray-500 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="text-center p-4 bg-[#363A4D] rounded-lg border border-gray-600">
      <Icon className={`mx-auto mb-2 ${colorClass}`} size={24} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );

  return (
    <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">Hashtag Profile</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Total Tweets" value={formatNumber(profileData.totalUsage)} colorClass="text-[#7140F4]" />
        <StatCard icon={Users} label="Unique Users" value={formatNumber(profileData.uniqueUsers)} colorClass="text-green-400" />
        <StatCard icon={Calendar} label="First Used" value={formatDate(profileData.firstUsed)} colorClass="text-yellow-400" />
        <StatCard icon={Calendar} label="Last Used" value={formatDate(profileData.lastUsed)} colorClass="text-orange-400" />
        <StatCard icon={Heart} label="Total Likes" value={formatNumber(profileData.totalLikes)} colorClass="text-red-400" />
        <StatCard icon={TrendingUp} label="Total Retweets" value={formatNumber(profileData.totalRetweets)} colorClass="text-teal-400" />
        <StatCard icon={MessageCircle} label="Total Replies" value={formatNumber(profileData.totalReplies)} colorClass="text-blue-400" />
        <StatCard icon={Globe} label="Languages" value={formatNumber(profileData.distinctLanguages)} colorClass="text-purple-400" />
      </div>
    </div>
  );
}
