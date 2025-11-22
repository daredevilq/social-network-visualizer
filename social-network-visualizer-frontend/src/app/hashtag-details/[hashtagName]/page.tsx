'use client';

import { useParams } from 'next/navigation';
import HashtagDetailsContainer from '@/app/components/Analysis/Hashtag/HashtagDetailsContainer';

export default function HashtagDetailsPage() {
  const params = useParams();
  const hashtagName = params.hashtagName as string;

  return <HashtagDetailsContainer hashtagName={hashtagName} />;
}
