'use client';

import {FormEvent, useCallback, useEffect, useRef, useState} from 'react';
import {useProject} from "@/app/context/ProjectContext";
import TweetList from './TweetList';
import TweetFilters from './TweetFilters';
import {Tweet, TweetAnalysisContainerProps, TweetResponse} from "@/types/tweetTypes";
import Link from 'next/link';
import {useInView} from 'react-intersection-observer';
import {ArrowLeft, ArrowUp, UserSearch} from 'lucide-react';

const BASE_URL = "http://localhost:8080";
const PAGE_SIZE = 10;

const TweetAnalysisContainer = ({ userName }: TweetAnalysisContainerProps) => {
    const { loading, runWithLoading } = useProject();
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { ref: inViewRef, inView } = useInView({ rootMargin: "200px" });

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [hashtagInput, setHashtagInput] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [highEngagement, setHighEngagement] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const tweetsContainerRef = useRef<HTMLDivElement | null>(null);

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

    const fetchTweets = useCallback(async (currentPage: number, reset = false) => {
        if (!userName || (!hasMore && !reset)) return;

        await runWithLoading(async () => {
            const hashtagQuery = hashtags.map(tag => `hashtags=${encodeURIComponent(tag)}`).join('&');
            const response = await fetch(
                `${BASE_URL}/tweet/all/${userName}?page=${currentPage}&limit=${PAGE_SIZE}&search=${search}&sortBy=${sortBy}&order=${order}&highEngagement=${highEngagement}&${hashtagQuery}`
            );            if (!response.ok) throw new Error('Failed to fetch tweets');
            const data: TweetResponse = await response.json();

            setTweets(prev => {
                return reset ? data.tweets : [...prev, ...data.tweets.filter(t => !prev.some(p => p.id === t.id))];
            });

            setPage(currentPage + 1);
            setHasMore(data.tweets.length === PAGE_SIZE);
        })
    }, [userName, hasMore, runWithLoading, search, sortBy, order, hashtags, highEngagement]);

    useEffect(() => {
        fetchTweets(1, true);
    }, [userName, sortBy, order, hashtags, highEngagement]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            fetchTweets(page);
        }
    }, [inView]);

    const handleHashtagAdd = () => {
        if (hashtagInput && !hashtags.includes(hashtagInput)) {
            setHashtags([...hashtags, hashtagInput]);
            setHashtagInput('');
        }
    };

    const handleHashtagRemove = (tagToRemove: string) => {
        setHashtags(hashtags.filter(tag => tag !== tagToRemove));
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetchTweets(1, true);
    };

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">
                <div className="relative w-full mb-4 px-4">
                    <Link href="/" className="absolute left-0 top-0">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5a33c1] rounded text-sm">
                            <ArrowLeft size={16} />
                            Back to Graph
                        </button>
                    </Link>

                    <h1 className="text-3xl font-bold text-center">Tweet Analysis for @{userName}</h1>

                    <Link href={`/user-details/${userName}`} className="absolute right-0 top-0">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm">
                            <UserSearch size={16} />
                            Analyze User
                        </button>
                    </Link>
                </div>

                <TweetFilters
                    search={search}
                    setSearch={setSearch}
                    handleSearchSubmit={handleSearchSubmit}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    order={order}
                    setOrder={setOrder}
                    hashtagInput={hashtagInput}
                    setHashtagInput={setHashtagInput}
                    handleHashtagAdd={handleHashtagAdd}
                    hashtags={hashtags}
                    removeHashtag={handleHashtagRemove}
                    setHighEngagement={setHighEngagement}
                    highEngagement={highEngagement}
                />

                <TweetList
                    tweets={tweets}
                    hasMore={hasMore}
                    inViewRef={inViewRef}
                    showScrollTop={showScrollTop}
                    scrollToTop={scrollToTop}
                    tweetsContainerRef={tweetsContainerRef}
                />

                {showScrollTop && (
                    <button
                        className="absolute top-12 right-12 bg-[#7140F4] hover:bg-[#5a33c1] text-white p-3 rounded-full shadow-lg transition"
                        onClick={scrollToTop}
                    >
                        <ArrowUp size={32} />
                    </button>
                )}
            </div>


        </div>
    );
};

export default TweetAnalysisContainer;
