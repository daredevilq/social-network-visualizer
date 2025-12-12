'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User2, Users, Search, Crown, Trophy } from 'lucide-react';

interface Author {
  userName: string;
}

interface Props {
  topAuthor: string;
  topPageRank: number;
  authors: Author[] | null;
}

export default function CommunityMembersCard({ topAuthor, topPageRank, authors }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const safeAuthors = authors || [];
  const filteredAuthors = safeAuthors.filter((a) => a.userName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg border border-white/5 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
        <div className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-[#7140F4]" />
          <h2 className="text-xl font-bold text-white">
            Community Members <span className="text-gray-500 ml-1 text-base font-normal">({safeAuthors.length})</span>
          </h2>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#3D3D4E] border border-white/5 text-gray-200
                       placeholder-gray-500 focus:outline-none focus:border-[#7140F4] focus:ring-1 focus:ring-[#7140F4]
                       transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {!searchTerm && (
          <div
            className="bg-[#3D3D4E] border border-white/5 hover:border-[#7140F4]/50 hover:bg-[#2a2a35] hover:-translate-y-0.5
                                   transition-all duration-200 rounded-xl relative overflow-hidden group cursor-pointer"
            onClick={() => router.push(`/user-details/${topAuthor}`)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7140F4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center justify-between p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#7140F4] flex items-center justify-center text-white shadow-lg ring-2 ring-[#2A2D3D] group-hover:ring-[#7140F4] transition-all">
                    <User2 size={24} />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-[#2A2D3D] p-1 rounded-full border-2 border-[#2A2D3D]">
                    <Crown size={10} strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                    Community Leader
                  </span>
                  <h3 className="text-lg font-bold text-white">{topAuthor}</h3>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A2D3D] border border-white/10 group-hover:border-[#7140F4]/50 transition-colors">
                  <Trophy className="w-3 h-3 text-[#7140F4]" />
                  <span className="text-sm font-bold text-white">{topPageRank.toFixed(4)}</span>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 mr-1">PageRank Score</span>
              </div>
            </div>
          </div>
        )}
        <div>
          {searchTerm && <p className="text-sm text-gray-400 mb-3">Search results:</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredAuthors.map((author) => {
              if (!searchTerm && author.userName === topAuthor) return null;

              return (
                <div
                  key={author.userName}
                  onClick={() => router.push(`/user-details/${author.userName}`)}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg
                                               bg-[#3D3D4E] border border-white/5
                                               hover:border-[#7140F4]/50 hover:bg-[#2a2a35] hover:-translate-y-0.5
                                               transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7140F4] flex items-center justify-center text-gray-400 group-hover:text-white transition-colors border border-white/5">
                    <User2 size={16} />
                  </div>

                  <span className="truncate font-medium text-gray-200 text-sm group-hover:text-white transition-colors">
                    {author.userName}
                  </span>
                </div>
              );
            })}
          </div>

          {filteredAuthors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="w-10 h-10 mb-2 opacity-20" />
              <p>No authors found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
