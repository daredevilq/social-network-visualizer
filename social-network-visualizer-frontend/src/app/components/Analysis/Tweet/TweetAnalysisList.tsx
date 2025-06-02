'use client';

import Link from 'next/link';
import {ArrowLeft, ArrowUp, UserSearch} from 'lucide-react';
import { TweetAnalysisContainerProps } from '@/types/tweetTypes';
import TweetAnalysisContainer from './TweetAnalysisContainer';
import { useRouter } from 'next/navigation';
import {useRef, useState, useEffect} from "react";

const TweetAnalysisList = ({ userName }: TweetAnalysisContainerProps) => {
    const router = useRouter();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const tweetsContainerRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = () => {
        if (tweetsContainerRef.current) {
            const scrollTop = tweetsContainerRef.current.scrollTop;
            if (scrollTop > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        }
    };

    const scrollToTop = () => {
        if (tweetsContainerRef.current) {
            tweetsContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        const container = tweetsContainerRef.current;
        container?.addEventListener('scroll', handleScroll);

        return () => {
            container?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">
                <div className="flex w-full mb-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md hover:cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Graph
                    </button>

                    <h1 className="text-3xl font-bold text-center flex-grow mx-4">
                        {userName ? `Tweet Analysis for @${userName}` : 'All Tweet Analysis'}
                    </h1>

                    <div className="min-w-32 text-right">
                        {userName ? (
                            <Link href={`/user-details/${userName}`}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md hover:cursor-pointer">
                                    <UserSearch size={16} />
                                    Analyze User
                                </button>
                            </Link>
                        ) : (
                            <div />
                        )}
                    </div>
                </div>

                <TweetAnalysisContainer
                    apiUrl={`http://localhost:8080/tweet/list/all`}
                    userName={userName}
                    tweetsContainerRef={tweetsContainerRef}
                />

                {showScrollTop && (
                    <button
                        className="absolute top-12 right-12 bg-[#7140F4] hover:bg-[#5a33c1] text-white p-3 rounded-full shadow-lg transition hidden lg:block"
                        onClick={scrollToTop}
                    >
                        <ArrowUp size={32} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TweetAnalysisList;
