import React from "react";
import {User2} from "lucide-react";
import { useRouter } from 'next/navigation';

interface Props {
    topAuthor: string;
    topPageRank: number;
    topHashtags: string[];
}

export default function CommunityMetrics({ topAuthor, topPageRank, topHashtags }: Props) {
    const tagsToShow = topHashtags.slice(0, 3);
    const router = useRouter();

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm">
            <div
                onClick={() => router.push(`/user-details/${topAuthor}`)}
                className="flex items-center gap-2 cursor-pointer hover:scale-105 hover:text-[#a78bfa] transition duration-200"
            >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shrink-0">
                    <User2 size={16} className="translate-x-[0.5px]" />
                </div>
                <span className="truncate font-medium text-gray-200">
                    {topAuthor}
                </span>
            </div>
            <span>
                <span className="opacity-70">
                    PageRank
                </span>
                {topPageRank.toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
                <span className="opacity-70">Hashtags&nbsp;</span>
                    {tagsToShow.length
                        ? tagsToShow.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-[#7140F4]/20 rounded-full text-xs">
                                #{tag}
                            </span>
                        )) : "—"}
            </span>
        </div>
    );
}
