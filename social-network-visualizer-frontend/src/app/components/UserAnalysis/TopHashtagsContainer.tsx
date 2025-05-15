import { Tag } from 'lucide-react';
import { useState } from 'react';

interface TopHashtagsContainerProps {
    topHashtags: string[];
}

export function TopHashtagsContainer({ topHashtags }: TopHashtagsContainerProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Top Hashtags
            </h2>

            {topHashtags && topHashtags.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {topHashtags.map((hashtag, index) => (
                            <div
                                key={index}
                                className="flex items-center bg-[#3D3D4E] px-3 py-2 rounded-lg text-sm hover:bg-[#4D4D5E] transition-colors"
                            >
                                <span className="text-[#7140F4] mr-1">#</span>
                                <span className="truncate">{hashtag}</span>
                            </div>
                        ))}
                    </div>

                    {topHashtags.length > 8 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {expanded ? 'Show less' : `Show all (${topHashtags.length})`}
                        </button>
                    )}
                </>
            ) : (
                <p className="text-gray-400">No hashtags data available.</p>
            )}
        </div>
    );
}