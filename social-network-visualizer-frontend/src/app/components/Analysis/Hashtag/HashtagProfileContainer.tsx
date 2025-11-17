import React, { useEffect, useState } from 'react';
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
  const [stats, setStats] = useState({
    totalUsage: 0,
    uniqueUsers: 0,
    totalLikes: 0,
    totalRetweets: 0,
    totalReplies: 0,
    distinctLanguages: 0,
  });

  useEffect(() => {
    if (!profileData) return;

    const targets = {
      totalUsage: profileData.totalUsage || 0,
      uniqueUsers: profileData.uniqueUsers || 0,
      totalLikes: profileData.totalLikes || 0,
      totalRetweets: profileData.totalRetweets || 0,
      totalReplies: profileData.totalReplies || 0,
      distinctLanguages: profileData.distinctLanguages || 0,
    };

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        totalUsage: Math.round(targets.totalUsage * progress),
        uniqueUsers: Math.round(targets.uniqueUsers * progress),
        totalLikes: Math.round(targets.totalLikes * progress),
        totalRetweets: Math.round(targets.totalRetweets * progress),
        totalReplies: Math.round(targets.totalReplies * progress),
        distinctLanguages: Math.round(targets.distinctLanguages * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [profileData]);

  if (!profileData) {
    return (
      <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700">
        <div className="h-8 w-1/3 bg-gray-600 rounded-md animate-pulse mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 bg-[#363A4D] rounded-lg border border-gray-600 animate-pulse">
              <div className="h-6 w-8 mx-auto mb-2 bg-gray-500 rounded-md"></div>
              <div className="h-8 w-1/2 mx-auto mb-1 bg-gray-500 rounded-md"></div>
              <div className="h-4 w-1/3 mx-auto bg-gray-500 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="text-center p-4 bg-[#363A4D] rounded-lg border border-gray-600 hover:border-gray-500 transition-colors duration-200">
      <Icon className={`mx-auto mb-2 ${colorClass}`} size={24} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );

  return (
    <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">Hashtag Profile</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Total Tweets" value={formatNumber(stats.totalUsage)} colorClass="text-[#7140F4]" />
        <StatCard icon={Users} label="Unique Users" value={formatNumber(stats.uniqueUsers)} colorClass="text-green-400" />

        <StatCard icon={Calendar} label="First Used" value={formatDate(profileData.firstUsed)} colorClass="text-yellow-400" />
        <StatCard icon={Calendar} label="Last Used" value={formatDate(profileData.lastUsed)} colorClass="text-orange-400" />

        <StatCard icon={Heart} label="Total Likes" value={formatNumber(stats.totalLikes)} colorClass="text-red-400" />
        <StatCard icon={TrendingUp} label="Total Retweets" value={formatNumber(stats.totalRetweets)} colorClass="text-teal-400" />
        <StatCard icon={MessageCircle} label="Total Replies" value={formatNumber(stats.totalReplies)} colorClass="text-blue-400" />
        <StatCard icon={Globe} label="Languages" value={formatNumber(stats.distinctLanguages)} colorClass="text-purple-400" />
      </div>
    </div>
  );
}
