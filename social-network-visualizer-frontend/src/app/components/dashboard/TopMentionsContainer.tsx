import { Users } from 'lucide-react';
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
                <div className="grid grid-cols-1 gap-3">
                    {mentions.map((mention) => (
                        <div
                            key={mention.username}
                            onClick={() => router.push(`/user-details/${mention.username}`)}
                            className="flex justify-between items-center bg-[#3D3D4E] hover:bg-[#4D4D5E] px-5 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-sm"
                        >
                            <div className="flex items-center mr-2 max-w-[70%]">
                                <span className="text-[#7140F4] mr-1">@</span>
                                <span className="truncate">{mention.username}</span>
                            </div>
                            <span className="text-gray-300 font-medium ml-auto">{mention.count}</span>
                        </div>
                    ))}
                </div>

            ) : (
                <p className="text-gray-400">No mention data available.</p>
            )}
        </div>
    );
}
