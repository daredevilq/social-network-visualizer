import {User2, Users} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Mention {
    username: string;
    count: number;
}

interface TopMentionsProps {
    mentions: Mention[];
}

export function TopMentionsContainer({ mentions }: TopMentionsProps) {
    const router = useRouter();

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Top Mentions
            </h2>

            {mentions && mentions.length > 0 ? (
                <div className="flex flex-col space-y-2">
                    {mentions.map((author) => (
                        <div
                            key={author.username}
                            onClick={() => router.push(`/user-details/${author.username}`)}
                            className="flex items-center justify-between bg-[#3D3D4E] hover:bg-[#4D4D5E] px-5 py-3 rounded-xl text-sm text-gray-100 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01]">
                            <div className="flex items-center gap-3 truncate">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                                    <User2 size={18} />
                                </div>
                                <span className="truncate font-medium text-gray-200">
                                  {author.username}
                                </span>
                            </div>
                            <span className="text-gray-300 font-medium ml-auto">
                                {author.count}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No mention data available.</p>
            )}
        </div>
    );
}
