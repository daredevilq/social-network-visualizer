import { Users, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export interface TopAuthor {
  username: string;
  count: number;
}

interface HashtagTopAuthorsContainerProps {
  authors?: TopAuthor[];
}

export default function HashtagTopAuthorsContainer({ authors }: HashtagTopAuthorsContainerProps) {
  if (!authors) {
    return (
      <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Users className="mr-2 text-[#7140F4]" />
          Top Authors
        </h2>
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-6 w-6 rounded-md bg-[#363A4D] animate-pulse"></div>
              <div className="h-10 w-10 rounded-full bg-[#363A4D] animate-pulse"></div>
              <div className="h-4 w-1/2 bg-[#363A4D] rounded-md animate-pulse"></div>
              <div className="ml-auto h-4 w-1/6 bg-[#363A4D] rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2A2D3D] rounded-lg p-6 border border-gray-700/50">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">Top Authors</h2>

      <div className="flex flex-col gap-3">
        {authors.length === 0 && <p className="text-gray-400 text-center text-sm">No top authors found for this hashtag.</p>}
        {authors.map((author, index) => {
          const initials = author.username.substring(0, 2).toUpperCase();

          return (
            <Link
              href={`/user-details/${author.username}`}
              key={author.username}
              className="flex items-center gap-3 p-3 bg-[#363A4D] rounded-lg border border-gray-600 hover:bg-[#40455a] transition-colors cursor-pointer"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#7140F4] flex items-center justify-center">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
              <span className="text-base text-white font-medium truncate" title={author.username}>
                @{author.username}
              </span>
              <span className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-sm font-medium text-gray-400">
                <MessageCircle className="h-4 w-4 text-blue-400" />
                {author.count.toLocaleString()}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
