
import { Tag } from 'lucide-react';
import {useRouter} from "next/navigation";

interface HashtagActivity {
    name: string;
    frequency: number;
}

interface TopHashtagsContainerProps {
    topHashtags: HashtagActivity[];
}

export function TopHashtagsContainer({ topHashtags }: TopHashtagsContainerProps) {
    const router = useRouter();
    const getSubtleVariantColor = (index: number) => {
        const baseR = 92;
        const baseG = 55;
        const baseB = 230;

        const alphas = [0.4, 0.5, 0.6, 0.7, 0.8];

        const variations = [
            { r: baseR, g: baseG, b: baseB },
            { r: baseR - 10, g: baseG, b: baseB + 10 },
            { r: baseR + 10, g: baseG, b: baseB - 10 },
            { r: baseR, g: baseG + 10, b: baseB },
            { r: baseR + 20, g: baseG + 10, b: baseB + 10 }
        ];

        const variationIndex = index % variations.length;
        const alphaIndex = Math.floor(index / variations.length) % alphas.length;

        const { r, g, b } = variations[variationIndex];
        const alpha = alphas[alphaIndex];

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const hashtagColors = topHashtags.reduce((colors, _, index) => {
        colors[index] = getSubtleVariantColor(index);
        return colors;
    }, {} as Record<number, string>);

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Top Hashtags
            </h2>

            {topHashtags && topHashtags.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {topHashtags.map((hashtag, index) => (
                        <div
                            key={index}
                            onClick={() => router.push(`/hashtag-details/${hashtag.name}`)}
                            className="px-4 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer text-center"
                            style={{ backgroundColor: hashtagColors[index] }}
                        >
                            {hashtag.name}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No hashtags data available.</p>
            )}
        </div>
    );
}