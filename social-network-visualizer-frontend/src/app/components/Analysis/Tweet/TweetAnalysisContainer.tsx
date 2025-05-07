'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useProject } from "@/app/context/ProjectContext";
import TweetCard from './TweetCard';
import { Tweet, TweetResponse, TweetAnalysisContainerProps } from "@/types/tweetTypes";
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

const BASE_URL = "http://localhost:8080";
const PAGE_SIZE = 10;

const TweetAnalysisContainer = ({ userName }: TweetAnalysisContainerProps) => {
    const { loading, runWithLoading } = useProject();
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { ref: inViewRef, inView } = useInView({ rootMargin: "200px" });
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

    const fetchTweets = useCallback(async (currentPage: number) => {
        if (!userName || !hasMore) return;

        await runWithLoading(async () => {
            const response = await fetch(`${BASE_URL}/tweet/all/${userName}?page=${currentPage}&limit=${PAGE_SIZE}`);
            if (!response.ok) throw new Error('Failed to fetch tweets');
            const data: TweetResponse = await response.json();

            setTweets(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const newTweets = data.tweets.filter(t => !existingIds.has(t.id));
                return [...prev, ...newTweets];
            });

            setPage(currentPage + 1);
            setHasMore(data.tweets.length === PAGE_SIZE);
        }).catch(err => {
            showStatus(`Error: ${err.message}`);
        });
    }, [userName, hasMore, runWithLoading]);

    useEffect(() => {
        fetchTweets(1);
    }, [userName]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            fetchTweets(page);
        }
    }, [inView]);

    const showStatus = (msg: string) => {
        clearTimeout(hideTimer.current as NodeJS.Timeout);
        hideTimer.current = setTimeout(() => setError(null), 3_000);
        setError(msg);
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">
                <div className="w-full flex justify-start pr-4">
                    <Link href="/">
                        <button className="px-4 py-2 bg-[#7140F4] hover:bg-[#8c5ef7] rounded text-[#FAFAFA] text-sm">
                            ← Back to Graph
                        </button>
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-6 text-center">Tweet Analysis for @{userName}</h1>

                {error && <p className="text-center text-red-400">{error}</p>}

                <div className="flex flex-col gap-4 pb-10 pr-5 overflow-y-auto scrollbar-dark max-h-[calc(100vh-240px)]">
                    {tweets.length === 0 ? (
                        <p className="text-center">No tweets available.</p>
                    ) : (
                        tweets.map((tweet) => (
                            <TweetCard key={tweet.id} tweet={tweet} />
                        ))
                    )}

                    {hasMore && (
                        <div ref={inViewRef} className="h-1 w-full" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TweetAnalysisContainer;
