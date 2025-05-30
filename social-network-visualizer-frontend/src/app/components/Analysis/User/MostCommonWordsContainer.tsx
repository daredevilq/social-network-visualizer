import { TrendingUp } from "lucide-react";

interface MostCommonWordsProps {
    words: string[];
}

export function MostCommonWordsContainer({ words }: MostCommonWordsProps) {
    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Most Common Words
            </h2>

            {words && words.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white text-sm">
                    {words.map((word, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-[#3D3D4E] px-4 py-3 rounded-lg transition duration-200 hover:bg-[#45455A]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#45455A] flex items-center justify-center text-xs font-bold text-gray-300">
                                    {index + 1}
                                </div>
                                <span className="font-medium">{word}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No words available.</p>
            )}
        </div>
    );
}

