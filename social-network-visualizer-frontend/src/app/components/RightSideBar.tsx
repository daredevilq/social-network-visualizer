'use client'
import {useEffect, useState} from 'react'
import {useProject} from "@/app/context/ProjectContext"
import {useRouter} from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/'

export default function RightSidebar() {
    const router = useRouter()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [topPosts, setTopPosts] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const {isSidebarOpen, setIsSidebarOpen, selectedUserName} = useProject()

    useEffect(() => {
        if (!isSidebarOpen || !selectedUserName) return
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const userDataRes = await fetch(`${API_BASE_URL}author/${selectedUserName}`)
                const data = await userDataRes.json()
                setUserData(data)

                const topPostsRes = await fetch(`${API_BASE_URL}author/last-posts/${selectedUserName}`)
                const posts = await topPostsRes.json()
                setTopPosts(posts)
            } catch (err) {
                setError('Failed to load user data. Please try again later.')
                console.error('Error fetching user data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [isSidebarOpen, selectedUserName])

    const onClose = () => {
        setIsSidebarOpen(false)
    }

    const showDetails = () => {
        if (selectedUserName) {
            router.push(`/user-details/${selectedUserName}`)
        }
    }

    const truncateUrl = (url: string, maxLength: number = 35) => {
        if (url.length <= maxLength) return url
        const start = url.substring(0, maxLength / 2)
        const end = url.substring(url.length - maxLength / 2)
        return `${start}...${end}`
    }


    return (
        <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 shadow-lg z-40 transform transition-transform duration-300 ease-in-out rounded-l-xl ${
                isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            } border-l-[1px] border-[#FAFAFA] rounded-tr-2xl rounded-br-2xl bg-[#262631]`}
        >
            <div className="p-6 h-full flex flex-col overflow-y-auto text-white space-y-6">
                <div className="flex items-center justify-between border-b border-gray-600 pb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{selectedUserName}</h1>
                        <button
                            onClick={showDetails}
                            className="px-3 py-1 text-white rounded-md shadow-md hover:bg-[#5c32c3] transition-colors text-sm flex items-center justify-center h-8 self-center"
                            aria-label="Show details"
                        >
                            <span className="whitespace-nowrap">Show details</span>
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-[#7140F4] text-white rounded-full shadow-md hover:bg-[#5c32c3] transition-colors"
                        aria-label="Close sidebar"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-[#3A1717] border border-[#e05252] text-white rounded-lg">
                        <p className="font-medium text-[#FF9494] mb-1">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-[#32323F] rounded-xl p-5 shadow-md">
                    <h3 className="text-lg font-semibold mb-4">User Statistics</h3>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 bg-[#3D3D4E] rounded-lg animate-pulse"/>
                            ))}
                        </div>
                    ) : userData ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#3D3D4E] p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Tweets</p>
                                <p className="text-xl font-bold">{userData.tweetsCount}</p>
                            </div>
                            <div className="bg-[#3D3D4E] p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Retweets</p>
                                <p className="text-xl font-bold">{userData.retweetsCount}</p>
                            </div>
                            <div className="bg-[#3D3D4E] p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Replies</p>
                                <p className="text-xl font-bold">{userData.repliesCount}</p>
                            </div>
                            <div className="bg-[#3D3D4E] p-3 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Avg. Likes</p>
                                <p className="text-xl font-bold">{userData.averageLikesCount}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-center py-4">No user data available</p>
                    )}
                </div>

                <div className="bg-[#32323F] rounded-xl p-5 shadow-md flex-grow">
                    <h3 className="text-lg font-semibold mb-4">Top Posts</h3>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 bg-[#3D3D4E] rounded-lg animate-pulse"/>
                            ))}
                        </div>
                    ) : topPosts && topPosts.length > 0 ? (
                        <div className="space-y-4">
                            {topPosts.map((url, index) => (
                                <div
                                    key={index}
                                    onClick={() => window.open(url, '_blank')}
                                    className="block bg-[#3D3D4E] hover:bg-[#4D4D5E] p-4 rounded-lg transition-all duration-200 border border-transparent hover:border-[#7140F4] cursor-pointer"
                                >
                                    <p className="text-sm truncate" title={url}>
                                        {url}
                                    </p>
                                    <div className="mt-2 text-[#7140F4] text-xs flex items-center">
                                        <span>View on Twitter</span>
                                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                      d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                            </svg>
                            <p className="text-gray-400 italic mb-1">No posts available</p>
                            <p className="text-xs text-gray-500">This user has no prominent posts</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    <hr className="border-gray-500 mb-4"/>
                    <a
                        href={`/tweet-analysis/${selectedUserName}`}
                        className="w-full inline-block text-center px-4 py-2 bg-[#7140F4] text-white rounded-md hover:bg-[#5c32c3] transition-colors"
                    >
                        View Tweet Analysis
                    </a>
                </div>

            </div>
        </div>
    )
}