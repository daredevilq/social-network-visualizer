import { FormEvent } from 'react';
import { Search, Plus } from 'lucide-react';

interface TweetFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchSubmit: (e: FormEvent) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    order: 'asc' | 'desc';
    setOrder: (value: 'asc' | 'desc') => void;
    hashtagInput: string;
    setHashtagInput: (value: string) => void;
    handleHashtagAdd: () => void;
    hashtags: string[];
    removeHashtag: (hashtag: string) => void;
    highEngagement: boolean;
    setHighEngagement: (value: boolean) => void;
}

const TweetFilters = ({
  search,
  setSearch,
  handleSearchSubmit,
  sortBy,
  setSortBy,
  order,
  setOrder,
  hashtagInput,
  setHashtagInput,
  handleHashtagAdd,
  hashtags,
  removeHashtag,
  highEngagement,
  setHighEngagement,
}: TweetFiltersProps) => {
    return (
        <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-4 mb-4 pt-1 px-1"
        >
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative w-full sm:w-1/2 md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search tweets..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        className="h-10 px-4 py-2 pr-10 rounded bg-gray-800 text-white w-full border border-[#7140F4] focus:outline-none focus:ring-1 focus:ring-[#7140F4]"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7140F4]"
                        title="Search"
                    >
                        <Search size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="relative w-full sm:w-1/4 md:w-1/6">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-10 px-4 py-2 pr-10 rounded-md bg-gray-800 text-white border border-[#7140F4] appearance-none text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#7140F4]"
                    >
                        <option value="date">Date</option>
                        <option value="likes">Likes</option>
                        <option value="retweets">Retweets</option>
                        <option value="replies">Replies</option>
                    </select>
                    <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-white text-xs">
                        ▼
                    </div>
                </div>

                <div className="relative w-full sm:w-1/4 md:w-1/6">
                    <select
                        value={order}
                        onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                        className="h-10 px-4 py-2 pr-10 rounded-md bg-gray-800 text-white border border-[#7140F4] appearance-none text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#7140F4]"
                    >
                        <option value="asc">Asc</option>
                        <option value="desc">Desc</option>
                    </select>
                    <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-white text-xs">
                        ▼
                    </div>
                </div>

                <div className="h-10 relative flex justify-center items-center gap-2 px-4 py-2 rounded-md bg-gray-800 border border-[#7140F4] text-white text-sm hover:ring-2 hover:ring-[#7140F4] transition flex-grow sm:w-1/4 md:w-1/6">
                    <input
                        type="checkbox"
                        id="highEngagement"
                        checked={highEngagement}
                        onChange={(e) => setHighEngagement(e.target.checked)}
                        className="appearance-none h-4 w-4 border border-[#7140F4] rounded-sm checked:bg-[#7140F4] checked:border-[#7140F4] focus:outline-none focus:ring-1 focus:ring-[#7140F4] transition"
                    />
                    <label htmlFor="highEngagement" className="cursor-pointer select-none">
                        Show only high engagement
                    </label>
                </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap w-full gap-2 items-center">
                <div className="relative w-full sm:w-1/2 md:w-1/3 flex-shrink-0">
                    <div className="flex items-center gap-2 w-full">
                        <input
                            type="text"
                            placeholder="#hashtag"
                            value={hashtagInput}
                            onChange={(e) => setHashtagInput(e.target.value)}
                            className="h-10 px-3 py-2 rounded bg-gray-800 text-white w-full border border-[#7140F4] focus:outline-none focus:ring-1 focus:ring-[#7140F4]"
                        />
                        <button
                            type="button"
                            onClick={handleHashtagAdd}
                            className="h-10 flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5a33c1] rounded text-sm whitespace-nowrap"
                        >
                            <Plus size={12} strokeWidth={2.5} />
                            Add Hashtag
                        </button>
                    </div>
                </div>

                {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {hashtags.map(tag => (
                            <div
                                key={tag}
                                className="flex items-center bg-[#333] text-white px-3 py-1 rounded border border-[#7140F4]"
                            >
                                #{tag}
                                <button
                                    onClick={() => removeHashtag(tag)}
                                    className="ml-2 text-red-400 hover:text-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </form>
    );
};

export default TweetFilters;
