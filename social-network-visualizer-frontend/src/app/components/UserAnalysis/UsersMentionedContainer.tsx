import {useRouter} from "next/navigation";


interface UsersMentionedContainerProps {
    userMentions: string[];
    message: string
}


export function UsersMentionedContainer({userMentions, message}: UsersMentionedContainerProps) {
    const router = useRouter();

    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">{message}</h2>

            {userMentions && userMentions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userMentions.map((user, index) => (
                        <div
                            key={index}
                            className="bg-[#3D3D4E] p-4 rounded-lg hover:bg-[#4D4D5E] cursor-pointer transition-colors"
                            onClick={() => router.push(`/user-details/${user}`)}
                        >
                            <div
                                className="w-10 h-10 rounded-full bg-[#7140F4] flex items-center justify-center mb-2">
                                {user.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="font-medium truncate">{user}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No connection data available.</p>
            )}
        </div>
    )
}