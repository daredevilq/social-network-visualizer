import React from "react";

interface Props {
    topAuthor: string;
    topPageRank: number;
    topHashtags: string[];
}

export default function CommunityMetrics({ topAuthor, topPageRank, topHashtags }: Props) {
    const tagsToShow = topHashtags.slice(0, 3);

    return (
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:gap-6 text-sm">
            <span><span className="opacity-70">Top author </span>@{topAuthor}</span>
            <span><span className="opacity-70">PageRank </span>{topPageRank.toFixed(2)}</span>
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
