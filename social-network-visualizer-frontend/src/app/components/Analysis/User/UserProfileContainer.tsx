'use client';

import React, { useEffect, useState } from 'react';
import { User, CalendarDays, MessageSquare, Repeat2, MessageCircle, Quote, Heart, BarChart3 } from 'lucide-react';

const StatItem = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => (
  <div
    className="group flex flex-col justify-between p-3 rounded-lg
                  bg-[#3D3D4E] border border-white/5 
                  hover:border-[#7140F4]/50 hover:bg-[#2a2a35] hover:-translate-y-0.5
                  transition-all duration-200 cursor-default shadow-sm hover:shadow-md"
  >
    <div className="flex items-start justify-between mb-1">
      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-gray-300 transition-colors">{label}</span>
      <Icon className="w-4 h-4 text-gray-500 group-hover:text-[#7140F4] transition-colors" />
    </div>
    <div className="text-2xl font-bold text-white tracking-tight">{value.toLocaleString()}</div>
  </div>
);

const EngagementItem = ({ label, value, icon: Icon, colorClass }: { label: string; value: number; icon: any; colorClass: string }) => (
  <div className="flex flex-col items-center justify-center p-3 bg-[#3D3D4E]/50 rounded-lg border border-white/5 hover:bg-[#3D3D4E] transition-colors flex-1">
    <div className={`p-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}/10 mb-1`}>
      <Icon className={`w-4 h-4 ${colorClass}`} />
    </div>
    <span className="text-lg font-bold text-white">{value.toFixed(2)}</span>
    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
  </div>
);

export function UserProfileContainer({ userData }: { userData: any }) {
  const [stats, setStats] = useState({
    tweetsCount: 0,
    retweetsCount: 0,
    repliesCount: 0,
    quotesCount: 0,
    averageLikesCount: 0,
    averageRepliesCount: 0,
    averageRetweetsCount: 0,
  });

  useEffect(() => {
    if (!userData) return;

    const targets = {
      tweetsCount: userData.tweetsCount || 0,
      retweetsCount: userData.retweetsCount || 0,
      repliesCount: userData.repliesCount || 0,
      quotesCount: userData.quotesCount || 0,
      averageLikesCount: userData.averageLikesCount || 0,
      averageRepliesCount: userData.averageRepliesCount || 0,
      averageRetweetsCount: userData.averageRetweetsCount || 0,
    };

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const ease = 1 - Math.pow(1 - progress, 3);

      setStats({
        tweetsCount: Math.round(targets.tweetsCount * ease),
        retweetsCount: Math.round(targets.retweetsCount * ease),
        repliesCount: Math.round(targets.repliesCount * ease),
        quotesCount: Math.round(targets.quotesCount * ease),
        averageLikesCount: Math.round(targets.averageLikesCount * ease * 100) / 100,
        averageRepliesCount: Math.round(targets.averageRepliesCount * ease * 100) / 100,
        averageRetweetsCount: Math.round(targets.averageRetweetsCount * ease * 100) / 100,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [userData]);

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg border border-white/5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center">
          <User className="w-5 h-5 mr-2 text-[#7140F4]" />
          <h2 className="text-xl font-bold text-white">User Profile</h2>
        </div>
        {userData?.dateOfFirstTweet && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#3D3D4E] px-3 py-1 rounded-full border border-white/5">
            <CalendarDays className="w-3.5 h-3.5 text-[#7140F4]" />
            <span>Since: {userData.dateOfFirstTweet}</span>
          </div>
        )}
      </div>

      {userData ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Tweets" value={stats.tweetsCount} icon={MessageSquare} />
            <StatItem label="Retweets" value={stats.retweetsCount} icon={Repeat2} />
            <StatItem label="Replies" value={stats.repliesCount} icon={MessageCircle} />
            <StatItem label="Quotes" value={stats.quotesCount} icon={Quote} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Average Engagement</h3>
            </div>
            <div className="flex gap-3">
              <EngagementItem label="Avg Likes" value={stats.averageLikesCount} icon={Heart} colorClass="text-rose-500" />
              <EngagementItem label="Avg Replies" value={stats.averageRepliesCount} icon={MessageCircle} colorClass="text-sky-500" />
              <EngagementItem label="Avg Retweets" value={stats.averageRetweetsCount} icon={Repeat2} colorClass="text-emerald-500" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <User className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm">No user data available.</p>
        </div>
      )}
    </div>
  );
}
