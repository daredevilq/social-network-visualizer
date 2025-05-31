'use client'
import {useEffect, useState} from 'react'
import {useProject} from "@/app/context/ProjectContext"
import {useRouter} from 'next/navigation'
import {ExternalLink, X} from 'lucide-react'
import {API_BASE_URL} from '@/app/configuration/urlConfig';
import {TweetPreview} from "@/app/interface/TweetPreview";

export default function RightSidebar() {
    const router = useRouter()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [lastPosts, setLastPosts] = useState<TweetPreview[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const {isSidebarOpen, setIsSidebarOpen, selectedUserData} = useProject()

    useEffect(() => {
        if (!isSidebarOpen || !selectedUserData?.name) return
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const userDataRes = await fetch(`${API_BASE_URL}/author/${selectedUserData.name}`)
                const data = await userDataRes.json()
                setUserData(data)

                const lastPostsRes = await fetch(`${API_BASE_URL}/author/last-posts/${selectedUserData.name}`)
                const posts: TweetPreview[] = await lastPostsRes.json()
                setLastPosts(posts)
            } catch (err) {
                setError('Failed to load user data. Please try again later.')
                console.error('Error fetching user data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [isSidebarOpen, selectedUserData])

    const onClose = () => {
        setIsSidebarOpen(false)
    }

    const showDetails = () => {
        if (selectedUserData) {
            router.push(`/user-details/${selectedUserData.name}`)
        }
    }

    const showUserCommunity = () => {
        if (selectedUserData) {
            router.push(`/community-analysis/${selectedUserData.community}`)
        }
    }

    const truncatePreview = (url: string, maxLength: number = 35) => {
        if (url.length <= maxLength) return url
        const start = url.substring(0, maxLength / 2)
        const end = url.substring(url.length - maxLength / 2)
        return `${start}...${end}`
    }

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            } border-l border-[#383845] rounded-tl-xl rounded-bl-xl bg-gradient-to-b from-[#262631] to-[#1E1E29]`}
        >
            <div className="p-5 h-full flex flex-col text-white">
                <div className="flex items-center justify-between border-b border-[#3D3D4E] pb-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7140F4] to-[#9C6FFF] flex items-center justify-center text-lg font-semibold">
                            {selectedUserData?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{selectedUserData?.name}</h1>
                            <p className="text-xs text-gray-400">Twitter User</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-[#32323F] hover:bg-[#3D3D4E] text-white rounded-full shadow-md transition-colors duration-200"
                        aria-label="Close sidebar"
                    >
                        <X size={18}/>
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-[#3A1717] border border-[#e05252] text-white rounded-lg animate-pulse">
                        <p className="font-medium text-[#FF9494] mb-1">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-[#32323F] rounded-xl p-4 shadow-md backdrop-blur-sm border border-[#3D3D4E]/50 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">User Statistics</h3>
                        <button
                            onClick={showDetails}
                            className="px-3 py-1 text-xs bg-[#7140F4] hover:bg-[#5c32c3] text-white rounded-md transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer
"
                        >
                            Show details
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 bg-[#3D3D4E] rounded-lg animate-pulse"/>
                            ))}
                        </div>
                    ) : userData ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                className="bg-gradient-to-r from-[#3D3D4E] to-[#454557] p-3 rounded-lg hover:shadow-lg transition-all duration-200 border border-[#3D3D4E]/70">
                                <p className="text-xs text-gray-400 mb-1">Tweets</p>
                                <p className="text-xl font-bold">{userData.tweetsCount}</p>
                            </div>
                            <div
                                className="bg-gradient-to-r from-[#3D3D4E] to-[#454557] p-3 rounded-lg hover:shadow-lg transition-all duration-200 border border-[#3D3D4E]/70">
                                <p className="text-xs text-gray-400 mb-1">Retweets</p>
                                <p className="text-xl font-bold">{userData.retweetsCount}</p>
                            </div>
                            <div
                                className="bg-gradient-to-r from-[#3D3D4E] to-[#454557] p-3 rounded-lg hover:shadow-lg transition-all duration-200 border border-[#3D3D4E]/70">
                                <p className="text-xs text-gray-400 mb-1">Replies</p>
                                <p className="text-xl font-bold">{userData.repliesCount}</p>
                            </div>
                            <div
                                className="bg-gradient-to-r from-[#3D3D4E] to-[#454557] p-3 rounded-lg hover:shadow-lg transition-all duration-200 border border-[#3D3D4E]/70">
                                <p className="text-xs text-gray-400 mb-1">Avg. Likes</p>
                                <p className="text-xl font-bold">{userData.averageLikesCount}</p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center h-24 bg-[#3D3D4E]/30 rounded-lg border border-dashed border-[#3D3D4E]">
                            <p className="text-gray-400 italic text-center">No user data available</p>
                        </div>
                    )}
                </div>

                <div
                    className="bg-[#32323F] rounded-xl p-4 shadow-md flex-1 max-h-fit backdrop-blur-sm border border-[#3D3D4E]/50 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Last 3 Posts</h3>
                        <button
                            onClick={showUserCommunity}
                            className="px-3 py-1 text-xs bg-[#7140F4] hover:bg-[#5c32c3] text-white rounded-md transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer
"
                        >
                            Show Community
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 scrollbar-dark">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-24 bg-[#3D3D4E] rounded-lg animate-pulse"/>
                                ))}
                            </div>
                        ) : lastPosts && lastPosts.length > 0 ? (
                            <div className="space-y-3">
                                {lastPosts.map(({url, contentPreview}, index) => (
                                    <div
                                        key={index}
                                        onClick={() => window.open(url, '_blank')}
                                        className="block bg-gradient-to-r from-[#3D3D4E] to-[#454557] hover:from-[#454557] hover:to-[#505063] p-4 rounded-lg transition-all duration-200 border border-[#3D3D4E]/70 hover:border-[#7140F4]/70 cursor-pointer hover:shadow-lg"
                                    >
                                        <p className="text-sm truncate mb-3" title={contentPreview || ''}>
                                            {contentPreview ? truncatePreview(contentPreview) : "no preview available"}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="text-[#9C6FFF] text-xs flex items-center">
                                                <span>View on Twitter</span>
                                                <ExternalLink className="w-3 h-3 ml-1"/>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {`Post ${index + 1}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center h-48 text-center bg-[#3D3D4E]/30 rounded-lg border border-dashed border-[#3D3D4E]">
                                <p className="text-gray-400 italic mb-1">No posts available</p>
                                <p className="text-xs text-gray-500">This user has no prominent posts</p>
                            </div>
                        )}
                        <div className="mt-3">
                            <button
                                onClick={() => router.push(`/tweet-analysis/${selectedUserData?.name}`)}
                                className="w-full px-3 py-2 text-sm bg-[#7140F4] hover:bg-[#5c32c3] text-white rounded-md transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                            >
                                Show more posts
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}