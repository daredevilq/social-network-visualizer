import React, { useEffect, useState } from 'react';

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

      setStats({
        tweetsCount: Math.round(targets.tweetsCount * progress),
        retweetsCount: Math.round(targets.retweetsCount * progress),
        repliesCount: Math.round(targets.repliesCount * progress),
        quotesCount: Math.round(targets.quotesCount * progress),
        averageLikesCount: Math.round(targets.averageLikesCount * progress * 100) / 100,
        averageRepliesCount: Math.round(targets.averageRepliesCount * progress * 100) / 100,
        averageRetweetsCount: Math.round(targets.averageRetweetsCount * progress * 100) / 100,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [userData]);

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg">
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
              <div className="text-3xl font-bold">{stats.tweetsCount}</div>
            </div>

            <div className="bg-[#3D3D4E] p-4 rounded-lg">
              <span className="text-gray-400">Retweets</span>
              <div className="text-3xl font-bold">{stats.retweetsCount}</div>
            </div>

            <div className="bg-[#3D3D4E] p-4 rounded-lg">
              <span className="text-gray-400">Replies</span>
              <div className="text-3xl font-bold">{stats.repliesCount}</div>
            </div>

            <div className="bg-[#3D3D4E] p-4 rounded-lg">
              <span className="text-gray-400">Quotes</span>
              <div className="text-3xl font-bold">{stats.quotesCount}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-600">
            <h3 className="text-xl mb-3">Engagement Metrics</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Average Likes:</span>
                <span className="font-medium">{stats.averageLikesCount}</span>
              </li>
              <li className="flex justify-between">
                <span>Average Replies:</span>
                <span className="font-medium">{stats.averageRepliesCount}</span>
              </li>
              <li className="flex justify-between">
                <span>Average Retweets:</span>
                <span className="font-medium">{stats.averageRetweetsCount}</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">No user data available.</p>
      )}
    </div>
  );
}
