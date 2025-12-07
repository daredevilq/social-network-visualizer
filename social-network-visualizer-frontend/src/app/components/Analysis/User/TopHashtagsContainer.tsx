import { Tag, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HashtagActivity {
  name: string;
  frequency: number;
}

interface TopHashtagsContainerProps {
  topHashtags: HashtagActivity[];
}

export function TopHashtagsContainer({ topHashtags }: TopHashtagsContainerProps) {
  const router = useRouter();

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col h-full border border-white/5">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <Tag className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Top Hashtags</h2>
      </div>

      {topHashtags && topHashtags.length > 0 ? (
        <div className="flex flex-wrap gap-2 content-start">
          {topHashtags.map((hashtag, index) => (
            <div
              key={index}
              onClick={() => router.push(`/hashtag-details/${hashtag.name}`)}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg
                         bg-[#3D3D4E] border border-white/5 
                         hover:border-[#7140F4]/50 hover:bg-[#2a2a35] hover:-translate-y-0.5
                         transition-all duration-200 cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#7140F4] transition-colors" />
              <span className="text-gray-200 font-medium text-sm group-hover:text-white transition-colors">{hashtag.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Tag className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-sm">No hashtags data available.</p>
        </div>
      )}
    </div>
  );
}
