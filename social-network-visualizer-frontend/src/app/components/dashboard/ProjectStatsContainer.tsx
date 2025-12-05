import { MessageSquare, Users, Hash, Share2, Repeat2, Network } from 'lucide-react';

interface ProjectData {
  tweetsCount: number;
  usersCount: number;
  hashtagsCount: number;
  relationsCount: number;
  communitiesCount: number;
  retweetCount: number;
}

interface Props {
  projectData: ProjectData | null;
}

const StatCard = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => (
  <div
    className="group flex flex-col justify-between p-4 rounded-lg
                  bg-[#3D3D4E] border border-white/5
                  hover:border-[#7140F4]/50 hover:bg-[#2a2a35] hover:-translate-y-0.5
                  transition-all duration-200 cursor-default shadow-sm hover:shadow-md"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider group-hover:text-gray-300 transition-colors">
        {label}
      </span>
      <Icon className="w-5 h-5 text-gray-500 group-hover:text-[#7140F4] transition-colors" />
    </div>
    <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value.toLocaleString()}</div>
  </div>
);

export function ProjectStatsContainer({ projectData }: Props) {
  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <div className="p-1.5 rounded-md bg-[#7140F4]/10 mr-3">
          <Network className="w-5 h-5 text-[#7140F4]" />
        </div>
        <h1 className="text-xl font-bold text-white">Project Statistics</h1>
      </div>

      {projectData ? (
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Tweets" value={projectData.tweetsCount} icon={MessageSquare} />
          <StatCard label="Communities" value={projectData.communitiesCount} icon={Network} />
          <StatCard label="Users" value={projectData.usersCount} icon={Users} />
          <StatCard label="Retweets" value={projectData.retweetCount} icon={Repeat2} />
          <StatCard label="Hashtags" value={projectData.hashtagsCount} icon={Hash} />
          <StatCard label="Relations" value={projectData.relationsCount} icon={Share2} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p>No stats data available.</p>
        </div>
      )}
    </div>
  );
}
