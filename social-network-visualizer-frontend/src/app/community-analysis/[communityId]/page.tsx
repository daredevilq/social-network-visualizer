'use client';

import '@/app/globals.css';
import { useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import LeftBar from '@/app/components/LeftBar';
import LeftSideBar from '@/app/components/LeftSideBar';
import LoadingOverlay from '@/app/components/Loading/LoadingOverlay';
import CommunityAnalysisDetailsContainer from "@/app/components/Analysis/Community/CommunityDetails/CommunityAnalysisDetailsContainer";
import {useParams} from "next/navigation";

export default function CommunityAnalysisPage() {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [selectedLeftSideBarContent, setSelectedLeftSideBarContent] = useState('');
    const { communityId } = useParams<{ communityId: string}>();
    const { loading } = useProject();

    return (
        <div className="min-h-screen flex bg-[#262631] overflow-y-auto scrollbar-dark">
            {loading && <LoadingOverlay/>}

            <LeftBar setIsLeftSideBarOpen={setIsLeftSidebarOpen}
                     setSelectedLeftSideBarContent={setSelectedLeftSideBarContent}
            />

            <LeftSideBar
                isOpen={isLeftSidebarOpen}
                selectedLeftSideBarContent={selectedLeftSideBarContent}
            />

            <div
                className="flex-1 min-w-0 overflow-auto transition-all duration-300"
                style={{ marginLeft: isLeftSidebarOpen ? '24rem' : '2rem' }}
            >
                <div className="max-w-full">
                    <CommunityAnalysisDetailsContainer communityId={communityId}/>
                </div>
            </div>
        </div>
    );
}
