import { useRouter } from 'next/navigation';
import { MessageSquareQuote, User2 } from 'lucide-react';

interface RetweetsOfContainerProps {
  retweetingUsers: string[];
}

export function RetweetsOfContainer({ retweetingUsers }: RetweetsOfContainerProps) {
  const router = useRouter();
  const hasData = retweetingUsers && retweetingUsers.length > 0;

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg border border-white/5 flex flex-col h-full w-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <MessageSquareQuote className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">
          Retweeted By <span className="text-gray-500 ml-1 text-base font-normal">({retweetingUsers?.length || 0})</span>
        </h2>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {retweetingUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => router.push(`/user-details/${user}`)}
              title={user}
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
          <MessageSquareQuote className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm">No retweet data available.</p>
        </div>
      )}
    </div>
  );
}
