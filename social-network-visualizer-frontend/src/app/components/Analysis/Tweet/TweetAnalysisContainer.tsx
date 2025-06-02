'use client';

import {FormEvent, useCallback, useEffect, useState} from 'react';
import {useProject} from "@/app/context/ProjectContext";
import TweetList from './TweetList';
import TweetFilters from './TweetFilters';
import {Tweet, TweetResponse} from "@/types/tweetTypes";
import {useInView} from 'react-intersection-observer';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TweetAnalysisContainerProps {
    apiUrl: string;
    userName: string | undefined;
    tweetsContainerRef: React.RefObject<HTMLDivElement | null>;
}

const PAGE_SIZE = 10;

const TweetAnalysisContainer = ({apiUrl, userName, tweetsContainerRef}: TweetAnalysisContainerProps) => {
    const { loading, runWithLoading } = useProject();
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const {ref: inViewRef, inView} = useInView({rootMargin: "200px"});

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [hashtagInput, setHashtagInput] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [highEngagement, setHighEngagement] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);

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

    const fetchTweets = useCallback(async (currentPage: number, reset = false) => {
        if (!apiUrl || (!hasMore && !reset)) return;

        await runWithLoading(async () => {
            const hashtagQuery = hashtags.map(tag => `hashtags=${encodeURIComponent(tag)}`).join('&');
            const userPrefix = userName ? `userName=${encodeURIComponent(userName)}&` : '';
            const response = await fetch(
                `${apiUrl}?${userPrefix}page=${currentPage}&limit=${PAGE_SIZE}&search=${search}&sortBy=${sortBy}&order=${order}&highEngagement=${highEngagement}&${hashtagQuery}`
            );
            if (!response.ok) throw new Error('Failed to fetch tweets');
            const data: TweetResponse = await response.json();

            setTweets(prev => {
                return reset ? data.tweets : [...prev, ...data.tweets.filter(t => !prev.some(p => p.id === t.id))];
            });

            setPage(currentPage + 1);
            setHasMore(data.tweets.length === PAGE_SIZE);
        })
    }, [apiUrl, hasMore, runWithLoading, search, sortBy, order, hashtags, highEngagement]);

    useEffect(() => {
        fetchTweets(1, true);
    }, [apiUrl, sortBy, order, hashtags, highEngagement]);

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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchTweets(1, true);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    return (
        <div className="relative flex flex-col flex-1 overflow-hidden">
            <div className="md:hidden flex justify-end relative z-10 pr-4">
                <div
                    onClick={() => setFiltersVisible(!filtersVisible)}
                    className="w-8 h-6 rounded-b-full bg-[#7140F4] hover:bg-[#5c32c3] cursor-pointer flex items-center justify-center"
                >
                    {filtersVisible ? (
                        <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-white" />
                    )}
                </div>
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${filtersVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} md:max-h-none md:opacity-100`}>
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
            </div>

            <TweetList
                tweets={tweets}
                hasMore={hasMore}
                inViewRef={inViewRef}
                tweetsContainerRef={tweetsContainerRef}
            />

        </div>
    );
};

export default TweetAnalysisContainer;
