import {useRouter} from "next/navigation";
import React, {useState} from "react";


export default function HashtagAnalysisContainer({hashtagName}: { hashtagName: string }) {
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter();

    return (
        <div className="w-full min-h-screen bg-[#262631] text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to Graph
                    </button>

                    <h1 className="text-3xl font-bold">{hashtagName}</h1>

                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md hover:cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="17 2 12 7 7 2"></polyline>
                            <path d="M2 12h20"></path>
                            <polyline points="17 22 12 17 7 22"></polyline>
                        </svg>
                        View Tweets
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
                        <div className="h-96 bg-gray-700 rounded-md animate-pulse"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    </div>
                )}
            </div>
        </div>
    )
}
