'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import TweetList from './TweetList';
import TweetFilters from './TweetFilters';
import { Tweet, TweetResponse } from '@/types/tweetTypes';
import { useInView } from 'react-intersection-observer';
import { ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { BannerType } from '@/app/components/Popups/Banner';
import { useNotification } from '@/app/context/NotificationProvider';
import { API_BASE_URL } from '@/app/configuration/urlConfig';

interface TweetAnalysisContainerProps {
  userName: string | undefined;
}

const PAGE_SIZE = 10;

const TweetAnalysisContainer = ({ userName }: TweetAnalysisContainerProps) => {
  const { loading, runWithLoading } = useProject();
  const { showNotification } = useNotification();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref: inViewRef, inView } = useInView({ rootMargin: '200px' });

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

  const fetchTweets = useCallback(
    async (currentPage: number, reset = false) => {
      if (!hasMore && !reset) return;

      await runWithLoading(async () => {
        try {
          const hashtagQuery = hashtags.map((tag) => `hashtags=${encodeURIComponent(tag)}`).join('&');
          const userPrefix = userName ? `userName=${encodeURIComponent(userName)}&` : '';
          const response = await fetch(
            `${API_BASE_URL}/tweet/list/all?${userPrefix}page=${currentPage}&limit=${PAGE_SIZE}&search=${search}&sortBy=${sortBy}&order=${order}&highEngagement=${highEngagement}&${hashtagQuery}`
          );
          if (!response.ok) throw new Error(`Failed to fetch tweets`);
          const data: TweetResponse = await response.json();

          setTweets((prev) => (reset ? data.tweets : [...prev, ...data.tweets.filter((t) => !prev.some((p) => p.id === t.id))]));
          setPage(currentPage + 1);
          setHasMore(data.tweets.length === PAGE_SIZE);
        } catch (err: any) {
          showNotification(err.message || 'Failed to fetch tweets', BannerType.ERROR);
        }
      });
    },
    [hasMore, runWithLoading, search, sortBy, order, hashtags, highEngagement, userName, showNotification]
  );

  useEffect(() => {
    fetchTweets(1, true);
  }, [sortBy, order, hashtags, highEngagement]);

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
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
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
    <div className="relative flex flex-col flex-1 min-h-0 w-full gap-6">
      <div className="bg-[#2A2D3D] rounded-xl border border-white/5 shadow-lg overflow-hidden">
        <div
          className="md:hidden p-4 flex justify-between items-center border-b border-white/5"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <span className="text-white font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#7140F4]" /> Filters
          </span>
          <button className="text-gray-400">
            {filtersVisible ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out
            ${filtersVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'}
          `}
        >
          <div className="p-6">
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
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <TweetList tweets={tweets} hasMore={hasMore} inViewRef={inViewRef} />
        {loading && hasMore && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#7140F4] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && tweets.length === 0 && <div className="text-center py-12 text-gray-400">No tweets found matching your criteria.</div>}
      </div>
    </div>
  );
};

export default TweetAnalysisContainer;
