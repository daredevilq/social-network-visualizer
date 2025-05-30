import { useRouter } from 'next/navigation';
import { MessageSquareQuote } from 'lucide-react';
import {useState} from "react";

interface RetweetsOfContainerProps {
    retweetingUsers: string[];
}

export function RetweetsOfContainer({ retweetingUsers }: RetweetsOfContainerProps) {
    const router = useRouter();
    const [hoveredUser, setHoveredUser] = useState<string | null>(null);

    return (
        <div className="bg-[#32323F] rounded-xl p-3 sm:p-4 md:p-6 shadow-lg w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-6 border-b border-gray-600 pb-2 flex items-center">
                <MessageSquareQuote className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Retweeted By
            </h2>

            {retweetingUsers && retweetingUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                    {retweetingUsers.map((user, index) => (
                        <div
                            key={index}
                            className="relative flex items-center bg-[#3D3D4E] p-2 sm:p-4 rounded-lg hover:bg-[#4D4D5E] cursor-pointer transition-colors"
                            onClick={() => router.push(`/user-details/${user}`)}
                            onMouseEnter={() => setHoveredUser(user)}
                            onMouseLeave={() => setHoveredUser(null)}
                        >
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#7140F4] flex items-center justify-center text-white font-semibold text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">
                                {user.substring(0, 1).toUpperCase()}
                            </div>
                            <div className="font-medium text-sm sm:text-base truncate max-w-full">
                                {user}
                            </div>

                            {hoveredUser === user && (
                                <div className="absolute z-10 left-1/2 transform -translate-x-1/2 -top-10 bg-[#1E1E2A] px-3 py-1.5 rounded-md shadow-lg text-sm whitespace-nowrap">
                                    {user}
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1E1E2A]"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No retweet data available.</p>
            )}
        </div>
    );
}
