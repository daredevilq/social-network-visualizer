import { User2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Mention {
  username: string;
  count: number;
}

interface TopMentionsProps {
  mentions: Mention[];
}

export function TopMentionsContainer({ mentions }: TopMentionsProps) {
  const router = useRouter();

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg flex flex-col h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <Users className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Top Mentions</h2>
      </div>

      {mentions && mentions.length > 0 ? (
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
          {mentions.map((author) => (
            <div
              key={author.username}
              onClick={() => router.push(`/user-details/${author.username}`)}
              className="group flex items-center justify-between px-4 py-3 rounded-lg
                         bg-[#3D3D4E] border border-white/5 hover:border-[#7140F4]/50 hover:bg-[#2a2a35]
                         transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7140F4] text-white shadow-sm flex-shrink-0">
                  <User2 size={16} />
                </div>

                <span className="text-gray-200 font-medium text-sm truncate group-hover:text-white transition-colors">
                  {author.username}
                </span>
              </div>
              <span className="text-[#7140F4] text-sm font-bold ml-auto pl-3">{author.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Users className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">No mention data available.</p>
        </div>
      )}
    </div>
  );
}
