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

export default function Home() {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [selectedLeftSideBarContent, setSelectedLeftSideBarContent] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");
    const {loading} = useProject();

    return (
        <div className="min-h-screen flex">
            {loading && <LoadingOverlay/>}
            <LeftBar setIsLeftSideBarOpen={setIsLeftSidebarOpen}
                     setSelectedLeftSideBarContent={setSelectedLeftSideBarContent}/>
            <LeftSidebar
                isOpen={isLeftSidebarOpen}
                selectedLeftSideBarContent={selectedLeftSideBarContent}
            />
            <SearchAndToggleModeContainer
                searchValue={searchQuery}
                onSearchChange={(value) => setSearchQuery(value)}
            />
            <GraphContainer/>
            <RightSidebar/>
        </div>
    );
}
