import { Hash, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HashtagActivity {
  name: string;
  frequency: number;
}

interface TopHashtagsContainerProps {
  topHashtags: HashtagActivity[];
}

export function HashtagActivityContainer({ topHashtags }: TopHashtagsContainerProps) {
  const router = useRouter();

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col h-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <Tag className="w-5 h-5 mr-2 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Hashtags Activity</h2>
      </div>

      {topHashtags && topHashtags.length > 0 ? (
        <div className="flex flex-wrap gap-2 content-start">
          {topHashtags.map((hashtag, index) => (
            <div
              key={index}
              onClick={() => router.push(`/hashtag-details/${hashtag.name}`)}
              className="group flex items-center gap-3 px-4 py-2 rounded-lg
                         bg-[#3D3D4E] border border-white/5 hover:border-indigo-500/50 hover:bg-[#2a2a35]
                         transition-all duration-200 cursor-pointer flex-grow md:flex-grow-0"
            >
              <Hash className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 transition-colors" />

              <span className="text-gray-200 font-medium text-xs md:text-sm whitespace-nowrap">{hashtag.name}</span>
              <span className="text-indigo-400/80 text-xs font-semibold ml-auto pl-2 border-l border-white/10">{hashtag.frequency}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Tag className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">No hashtags data available.</p>
        </div>
      )}
    </div>
  );
}
