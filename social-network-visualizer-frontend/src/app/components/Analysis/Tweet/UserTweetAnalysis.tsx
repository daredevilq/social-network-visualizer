'use client';

import Link from 'next/link';
import { ArrowLeft, UserSearch } from 'lucide-react';
import { TweetAnalysisContainerProps } from '@/types/tweetTypes';
import TweetAnalysisContainer from './TweetAnalysisContainer';

const UserTweetAnalysis = ({ userName }: TweetAnalysisContainerProps) => {

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">
                <div className="relative w-full mb-4">
                    <Link href="/" className="absolute left-0 top-0 pl-1">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5a33c1] rounded text-sm">
                            <ArrowLeft size={16} />
                            Back to Graph
                        </button>
                    </Link>

                    <h1 className="text-3xl font-bold text-center">Tweet Analysis for @{userName}</h1>

                    <Link href={`/user-details/${userName}`} className="absolute right-0 top-0 pr-1">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm">
                            <UserSearch size={16} />
                            Analyze User
                        </button>
                    </Link>
                </div>

                <TweetAnalysisContainer apiUrl={`http://localhost:8080/tweet/all/${userName}`} />
            </div>
        </div>
    );
};

export default UserTweetAnalysis;