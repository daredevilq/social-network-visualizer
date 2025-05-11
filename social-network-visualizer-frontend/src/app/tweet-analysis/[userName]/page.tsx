"use client";

import '@/app/globals.css';
import {useState} from 'react';
import { useParams } from 'next/navigation';
import {useProject} from '@/app/context/ProjectContext';
import LeftBar from "@/app/components/LeftBar";
import LeftSideBar from "@/app/components/LeftSideBar";
import LoadingOverlay from "@/app/components/Loading/LoadingOverlay";
import TweetAnalysisContainer from "@/app/components/Analysis/Tweet/TweetAnalysisContainer";

export default function TweetAnalysisPage() {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [selectedGraph, setSelectedGraph] = useState("standardGraph");
    const [selectedLeftSideBarContent, setSelectedLeftSideBarContent] = useState("home");
    const {loading} = useProject();
    const { userName } = useParams<{ userName: string | string[] }>();
    const normalizedUserName = Array.isArray(userName) ? userName[0] : userName;

    return (
        <div className="min-h-screen flex">
            {loading && <LoadingOverlay/>}

            <LeftBar setIsLeftSideBarOpen={setIsLeftSidebarOpen}
                     setSelectedLeftSideBarContent={setSelectedLeftSideBarContent}
            />

            <LeftSideBar
                isOpen={isLeftSidebarOpen}
                selectedGraph={selectedGraph}
                setSelectedGraph={setSelectedGraph}
                selectedLeftSideBarContent={selectedLeftSideBarContent}
            />

            <div
                className="flex-1 min-w-0 overflow-auto transition-all duration-300"
                style={{ marginLeft: isLeftSidebarOpen ? '24rem' : '4rem' }}
            >
                <div className="max-w-full">
                    <TweetAnalysisContainer userName={normalizedUserName} />
                </div>
            </div>
        </div>
    );

}
