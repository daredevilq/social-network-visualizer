'use client';

import { useEffect, useRef, useState } from 'react';
import { useProject } from "@/app/context/ProjectContext";
import TweetCard from './TweetCard';
import { Tweet, TweetResponse, TweetAnalysisContainerProps } from "@/types/tweetTypes";
import Link from 'next/link';


const TweetAnalysisContainer = ({ userName }: TweetAnalysisContainerProps) => {
    const { loading, runWithLoading } = useProject();
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (loading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [loading]);

    const fetchTweets = async (currentPage: number) => {
        if (!userName) return;

        await runWithLoading(async () => {
            const response = await fetch(`http://localhost:8080/tweet/all/${userName}?page=${currentPage}&limit=10`);
            if (!response.ok) throw new Error('Failed to fetch tweets');
            const data: TweetResponse = await response.json();
            setTweets(data.tweets);
            setPage(data.page);
            setTotalPages(data.totalPages);
        }).catch(err => {
            showStatus(`Error: ${err.message}`);
        });
    };

    useEffect(() => {
        fetchTweets(page);
    }, [userName, page]);

    const showStatus = (msg: string) => {
        clearTimeout(hideTimer.current as NodeJS.Timeout);
        hideTimer.current = setTimeout(() => setError(null), 3_000);
        setError(msg);
    };

    const handlePrev = () => page > 1 && setPage(page - 1);
    const handleNext = () => page < totalPages && setPage(page + 1);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden text-[#FAFAFA]">
            <div className="flex flex-col items-center h-full pt-8 pb-8">
                <div className="w-full flex justify-end pr-8">
                    <Link href="/">
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm">
                            ← Back to Graph
                        </button>
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-6">Tweet Analysis for @{userName}</h1>

                {tweets.length === 0 ? (
                    <p>No tweets available.</p>
                ) : (
                    <>
                        <div className="space-y-4 mt-4 max-w-4xl w-full">
                            {tweets.map((tweet) => (
                                <TweetCard key={tweet.id} tweet={tweet} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center space-x-4 mt-6">
                                {page > 1 && (
                                    <button
                                        onClick={handlePrev}
                                        className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                                    >
                                        Previous
                                    </button>
                                )}
                                <span>
                                    Page {page} of {totalPages}
                                </span>
                                {page < totalPages && (
                                    <button
                                        onClick={handleNext}
                                        className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TweetAnalysisContainer;
