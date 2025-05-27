"use client";

import '@/app/globals.css';
import {useState} from 'react';
import {useProject} from '@/app/context/ProjectContext';
import LeftBar from "@/app/components/LeftBar";
import LeftSideBar from "@/app/components/LeftSideBar";
import LoadingOverlay from "@/app/components/Loading/LoadingOverlay";
import TweetAnalysisList from "@/app/components/Analysis/Tweet/TweetAnalysisList";

export default function TweetAnalysisPage() {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [selectedLeftSideBarContent, setSelectedLeftSideBarContent] = useState("home");
    const {loading} = useProject();

    return (
        <div className="min-h-screen flex bg-[#262631]">
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
                    <TweetAnalysisList userName={undefined} />
                </div>
            </div>
        </div>
    );

}
