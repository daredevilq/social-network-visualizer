import { useRouter } from 'next/navigation';
import { AtSign, User2 } from 'lucide-react';

interface UsersMentionedContainerProps {
  userMentions: string[];
  message?: string;
}

export function UsersMentionedContainer({ userMentions, message }: UsersMentionedContainerProps) {
  const router = useRouter();
  const hasData = userMentions && userMentions.length > 0;
  const title = message || 'Users Mentioned by this User';

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col h-full border border-white/5">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <AtSign className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">
          {title} <span className="text-gray-500 ml-1 text-base font-normal">({userMentions?.length || 0})</span>
        </h2>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {userMentions.map((user, index) => (
            <div
              key={index}
              onClick={() => router.push(`/user-details/${user}`)}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg
                         bg-[#3D3D4E] border border-white/5 
                         hover:border-[#7140F4]/50 hover:bg-[#2a2a35] hover:-translate-y-0.5
                         transition-all duration-200 cursor-pointer"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7140F4] flex items-center justify-center text-white border border-white/5 shadow-sm">
                <User2 size={16} />
              </div>
              <div className="truncate font-medium text-gray-200 text-sm group-hover:text-white transition-colors">{user}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <AtSign className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm">No mentions available.</p>
        </div>
      )}
    </div>
  );
}
