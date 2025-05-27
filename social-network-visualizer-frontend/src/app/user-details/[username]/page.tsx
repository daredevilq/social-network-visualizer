'use client'

import UserDetailsContainer from '@/app/components/Analysis/User/UserDetailsContainer'
import { useParams } from 'next/navigation'

export default function UserDetailsPage() {
    const params = useParams()
    const username = params.username as string

    return <UserDetailsContainer username={username} />
}