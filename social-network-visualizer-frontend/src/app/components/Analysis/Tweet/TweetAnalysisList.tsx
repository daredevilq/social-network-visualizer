'use client';

import Link from 'next/link';
import { ArrowLeft, UserSearch } from 'lucide-react';
import { TweetAnalysisContainerProps } from '@/types/tweetTypes';
import TweetAnalysisContainer from './TweetAnalysisContainer';
import { useRouter } from 'next/navigation';

const TweetAnalysisList = ({ userName }: TweetAnalysisContainerProps) => {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">
                <div className="relative w-full mb-4">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Graph
                    </button>

                    <h1 className="text-3xl font-bold text-center">
                        {userName
                            ? `Tweet Analysis for @${userName}`
                            : 'All Tweet Analysis'}
                    </h1>

                    {userName && (
                        <Link href={`/user-details/${userName}`} className="absolute right-0 top-0 pr-1">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md hover:cursor-pointer"
                            >
                                <UserSearch size={16} />
                                Analyze User
                            </button>
                        </Link>
                    )}
                </div>

                <TweetAnalysisContainer
                    apiUrl={`http://localhost:8080/tweet/list/all`}
                    userName={userName}
                />
            </div>
        </div>
    );
};

export default TweetAnalysisList;
