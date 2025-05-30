'use client'

import {useParams} from 'next/navigation'
import HashtagAnalysisContainer from "@/app/components/Analysis/Hashtag/HashtagAnalysisContainer";

export default function HashtagDetailsPage() {
    const params = useParams()
    const hashtagName = params.hashtagName as string

    return <HashtagAnalysisContainer hashtagName={hashtagName}/>
}
