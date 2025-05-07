"use client";

import '../app/globals.css';
import {useState} from 'react';
import LeftBar from "./components/LeftBar";
import GraphContainer from "./components/GraphContainer";
import RightSidebar from "@/app/components/RightSideBar";
import LeftSidebar from "./components/LeftSideBar";
import LoadingOverlay from "@/app/components/Loading/LoadingOverlay"
import {useProject} from '@/app/context/ProjectContext';
import SearchAndToggleModeContainer from "@/app/components/SearchAndToggleModeContainer";
import AnalysisContainer from "@/app/components/Analysis/AnalysisContainer";

export default function Home() {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [selectedGraph, setSelectedGraph] = useState("standardGraph")
    const [selectedLeftSideBarContent, setSelectedLeftSideBarContent] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");
    const {loading, isGraphMode} = useProject();

    return (
        <div className="min-h-screen flex">
            {loading && <LoadingOverlay/>}

            <LeftBar setIsLeftSideBarOpen={setIsLeftSidebarOpen}
                     setSelectedLeftSideBarContent={setSelectedLeftSideBarContent}
            />

            <LeftSidebar
                isOpen={isLeftSidebarOpen}
                selectedGraph={selectedGraph}
                setSelectedGraph={setSelectedGraph}
                selectedLeftSideBarContent={selectedLeftSideBarContent}
            />

            <SearchAndToggleModeContainer value={searchQuery} onSearchChange={(value) => setSearchQuery(value)}/>
            {isGraphMode ?
                <GraphContainer selectedGraph={selectedGraph}/> :
                <AnalysisContainer></AnalysisContainer>
            }
            <RightSidebar/>
        </div>
    );
}
