'use client';

import Colors from '@/app/utils/Colors';
import { useEffect, useRef, useState } from 'react';
import { ScrollDownInfoIcon } from '@/app/components/icons/Icons';

interface LegendItemProps {
  icon: React.JSX.Element;
  title: string;
  description: string;
}

const LegendItem = ({ icon, title, description }: LegendItemProps) => (
  <li className="flex items-center space-x-4 py-3">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{icon}</div>
    <div className="flex flex-col">
      <span className="font-semibold text-white">{title}</span>
      <span className="text-sm text-gray-400">{description}</span>
    </div>
  </li>
);

const AuthorIcon = () => <div className="w-6 h-6 bg-[#5C37E6] rounded-full shadow-[0_0_15px_rgba(92,55,230,0.8)]" />;

const TweetIcon = () => <div className="w-4 h-4 bg-[#3B82F6] rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />;

const HashtagIcon = () => <div className="w-3 h-3 bg-[#eab308] rounded-full shadow-[0_0_12px_rgba(234,179,8,0.8)]" />;

interface LinkIconBaseProps {
  color: string;
}

const linkStyles = {
  POSTED: { color: Colors.AuthorTweetLinkColorLow() },
  MENTIONS: { color: Colors.AuthorAuthorLinkColorLow() },
  MENTION: { color: Colors.AuthorTweetLinkColorLow() },
  RETWEETS: { color: Colors.AuthorAuthorLinkColorLow() },
  RETWEETED: { color: Colors.TweetTweetLinkColorLow() },
  REPLIES: { color: Colors.AuthorAuthorLinkColorLow() },
  REPLY_TO: { color: Colors.TweetTweetLinkColorLow() },
  HAS_REPLY: { color: Colors.AuthorTweetLinkColorLow() },
  HAS_PARENT: { color: Colors.TweetTweetLinkColorLow() },
  QUOTED: { color: Colors.TweetTweetLinkColorLow() },
  USES_HASHTAG: { color: Colors.AuthorHashtagLinkColorLow() },
  HAS_HASHTAG: { color: Colors.TweetHashtagLinkColorLow() },
  SHARES_HASHTAG: { color: Colors.AuthorAuthorLinkColorLow() },
  COMMUNITY_LINK: { color: Colors.GoldColor() },
  SHORTEST_PATH_AND_BRIDGES: { color: Colors.PurpleColor() },
};

const LinkIconBase = ({ color }: LinkIconBaseProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g>
      <path d="M4 12H20" stroke={color} strokeWidth="2" />
      <path d="M15 7L20 12L15 17" stroke={color} strokeWidth="2" />
    </g>
  </svg>
);

const LinkIcon_POSTED = () => <LinkIconBase {...linkStyles.POSTED} />;
const LinkIcon_MENTIONS = () => <LinkIconBase {...linkStyles.MENTIONS} />;
const LinkIcon_MENTION = () => <LinkIconBase {...linkStyles.MENTION} />;
const LinkIcon_RETWEETS = () => <LinkIconBase {...linkStyles.RETWEETS} />;
const LinkIcon_RETWEETED = () => <LinkIconBase {...linkStyles.RETWEETED} />;
const LinkIcon_REPLIES = () => <LinkIconBase {...linkStyles.REPLIES} />;
const LinkIcon_REPLY_TO = () => <LinkIconBase {...linkStyles.REPLY_TO} />;
const LinkIcon_HAS_REPLY = () => <LinkIconBase {...linkStyles.HAS_REPLY} />;
const LinkIcon_HAS_PARENT = () => <LinkIconBase {...linkStyles.HAS_PARENT} />;
const LinkIcon_QUOTED = () => <LinkIconBase {...linkStyles.QUOTED} />;
const LinkIcon_USES_HASHTAG = () => <LinkIconBase {...linkStyles.USES_HASHTAG} />;
const LinkIcon_HAS_HASHTAG = () => <LinkIconBase {...linkStyles.HAS_HASHTAG} />;
const LinkIcon_SHARES_HASHTAG = () => <LinkIconBase {...linkStyles.SHARES_HASHTAG} />;
const LinkIcon_COMMUNITY_LINK = () => <LinkIconBase {...linkStyles.COMMUNITY_LINK} />;
const LinkIcon_SHORTEST_PATH_AND_BRIDGES = () => <LinkIconBase {...linkStyles.SHORTEST_PATH_AND_BRIDGES} />;

export default function GraphLegendContent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);
  return (
    <div className="relative h-full flex flex-col text-white px-4 pt-4">
      <h1 className="text-2xl font-bold border-b border-gray-700 pb-2 mb-4">Graph Legend</h1>
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="
          flex-grow overflow-y-auto pb-4 space-y-6
          scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
        "
      >
        <div>
          <ul className="divide-y divide-gray-700 border-b border-gray-700 pb-2 mb-4 max-w-sm">
            <LegendItem icon={<AuthorIcon />} title="Author" description="A user. Size often indicates influence (e.g., PageRank)." />
            <LegendItem icon={<TweetIcon />} title="Tweet" description="A single publication (post)." />
            <LegendItem icon={<HashtagIcon />} title="Hashtag" description="A keyword. Size often indicates popularity." />
          </ul>
        </div>
        <div>
          <ul className="divide-y divide-gray-700 max-w-sm">
            <LegendItem icon={<LinkIcon_MENTIONS />} title="MENTIONS" description="Author mentions another author" />
            <LegendItem icon={<LinkIcon_REPLIES />} title="REPLIES" description="Author repplied to another author" />
            <LegendItem icon={<LinkIcon_RETWEETS />} title="RETWEETS" description="Author retweeted another author" />
            <LegendItem
              icon={<LinkIcon_SHARES_HASHTAG />}
              title="SHARES_HASHTAG"
              description="Author shares a hashtag with another author"
            />
            <LegendItem icon={<LinkIcon_POSTED />} title="POSTED" description="Author published a tweet" />
            <LegendItem icon={<LinkIcon_MENTION />} title="MENTION" description="Tween mentions an author" />
            <LegendItem icon={<LinkIcon_HAS_REPLY />} title="HAS_REPLY" description="Tweet has a reply to author" />
            <LegendItem icon={<LinkIcon_REPLY_TO />} title="REPLY_TO" description="Tweet has reply to another tweet" />
            <LegendItem icon={<LinkIcon_HAS_PARENT />} title="HAS_PARENT" description="Tweet has a parent relationship" />
            <LegendItem icon={<LinkIcon_RETWEETED />} title="RETWEETED" description="Tweet is a retweet of another tweet" />
            <LegendItem icon={<LinkIcon_QUOTED />} title="QUOTED" description="Tweet is quoted of another tweet" />
            <LegendItem icon={<LinkIcon_HAS_HASHTAG />} title="HAS_HASHTAG" description="Tweet contains a hashtag" />
            <LegendItem icon={<LinkIcon_USES_HASHTAG />} title="USES_HASHTAG" description="Author uses hashtag" />
            <LegendItem
              icon={<LinkIcon_COMMUNITY_LINK />}
              title="COMMUNITY_LINK"
              description="Link used to determine community structure"
            />
            <LegendItem
              icon={<LinkIcon_SHORTEST_PATH_AND_BRIDGES />}
              title="SHORTEST_PATH / BRIDGE"
              description="Edges highlighted as shortest path or graph bridges"
            />
          </ul>
        </div>
      </div>
      <div
        className={`
          absolute bottom-0 left-0 right-0 
          flex justify-center items-end pb-2 h-16
          pointer-events-none transition-opacity duration-300
          ${canScrollDown ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <ScrollDownInfoIcon />
      </div>
    </div>
  );
}
