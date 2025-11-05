'use client';

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

const AuthorIcon = () => <div className="w-6 h-6 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.7)]" />;

const TweetIcon = () => <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.8)]" />;

const HashtagIcon = () => <div className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.8)]" />;

const LinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow-cyan)">
      <path d="M4 12H20" stroke="#22d3ee" strokeWidth="2" />
      <path d="M15 7L20 12L15 17" stroke="#22d3ee" strokeWidth="2" />
    </g>
  </svg>
);

export default function HelpContent() {
  return (
    <div className="relative h-full flex flex-col text-white px-4 pt-4">
      <h1 className="text-2xl font-bold border-b pb-2 mb-4">Graph Legend</h1>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-300">Nodes:</h3>
          <ul className="divide-y divide-gray-700 max-w-sm">
            <LegendItem icon={<AuthorIcon />} title="Author" description="A user. Size often indicates influence (e.g., PageRank)." />
            <LegendItem icon={<TweetIcon />} title="Tweet" description="A single publication (post)." />
            <LegendItem icon={<HashtagIcon />} title="Hashtag" description="A keyword. Size often indicates popularity." />
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 mt-6 text-gray-300">Links:</h3>
          <ul className="divide-y divide-gray-700 max-w-sm">
            <LegendItem icon={<LinkIcon />} title="POSTED" description="Author published a tweet." />
            <LegendItem icon={<LinkIcon />} title="MENTIONS" description="Tweet mentions a user." />
            <LegendItem icon={<LinkIcon />} title="MENTION" description="A mention relationship (synonym of MENTIONS)." />
            <LegendItem icon={<LinkIcon />} title="RETWEETS" description="Author retweeted a tweet." />
            <LegendItem icon={<LinkIcon />} title="RETWEETED" description="Tweet is a retweet of another." />
            <LegendItem icon={<LinkIcon />} title="REPLIES" description="Tweet is a reply to another." />
            <LegendItem icon={<LinkIcon />} title="REPLY_TO" description="A reply relationship to a tweet/author." />
            <LegendItem icon={<LinkIcon />} title="HAS_REPLY" description="Tweet has a reply." />
            <LegendItem icon={<LinkIcon />} title="HAS_PARENT" description="Tweet has a parent relationship (e.g., is a reply)." />
            <LegendItem icon={<LinkIcon />} title="QUOTED" description="Tweet quotes another tweet." />
            <LegendItem icon={<LinkIcon />} title="USES_HASHTAG" description="Author used a hashtag." />
            <LegendItem icon={<LinkIcon />} title="HAS_HASHTAG" description="Tweet contains a hashtag." />
            <LegendItem icon={<LinkIcon />} title="SHARES_HASHTAG" description="Author shares a hashtag." />
          </ul>
        </div>
      </div>
    </div>
  );
}
