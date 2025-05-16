'use client'

import UserDetailsContainer from '@/app/components/UserAnalysis/UserDetailsContainer'
import { useParams } from 'next/navigation'

export default function UserDetailsPage() {
    const params = useParams()
    const username = params.username as string

    return <UserDetailsContainer username={username} />
}