import {Tag} from 'lucide-react';
import {useState} from 'react';
import {useRouter} from "next/navigation";

interface HashtagActivity {
    name: string;
    frequency: number;
}

interface TopHashtagsContainerProps {
    topHashtags: HashtagActivity[];
}

export function HashtagActivityContainer({topHashtags}: TopHashtagsContainerProps) {
    const router = useRouter();

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <Tag className="w-5 h-5 mr-2"/>
                Hashtags Activity
            </h2>

            {topHashtags && topHashtags.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {topHashtags.map((hashtag, index) => (
                            <div
                                key={index}
                                onClick={() => router.push(`/hashtag-details/${hashtag.name}`)}
                                className="flex items-center justify-between bg-[#3D3D4E] px-3 py-2 rounded-lg text-sm hover:bg-[#4D4D5E] transition-colors hover:cursor-pointer"
                            >
                                <div className="flex items-center mr-2 max-w-[70%]">
                                    <span className="text-[#7140F4] mr-1">#</span>
                                    <span className="truncate">{hashtag.name}</span>
                                </div>
                                <span className="text-gray-300 font-medium ml-auto">{hashtag.frequency}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-gray-400">No hashtags data available.</p>
            )}
        </div>
    );
}