"use client";

import '../app/globals.css';
import {useState} from 'react';
import LeftBar from "./component/LeftBar";
import GraphContainer from "./component/GraphContainer";
import RightSidebar from "@/app/component/RightSideBar";
import LeftSidebar from "./component/LeftSideBar";

export default function Home() {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState("testUser")
    const [selectedGraph, setSelectedGraph] = useState("standardGraph")
    const [selectedLeftSideBarContent, setSelectedLeftSideBarContent] = useState("home");
    const [shortestPath, setShortestPath] = useState<string[]>([]);

    return (
        <div className="min-h-screen flex">
            <LeftBar setIsLeftSideBarOpen={setIsLeftSidebarOpen} setSelectedLeftSideBarContent={setSelectedLeftSideBarContent}/>
            <LeftSidebar
                isOpen={isLeftSidebarOpen}
                selectedGraph={selectedGraph}
                setSelectedGraph={setSelectedGraph}
                selectedLeftSideBarContent={selectedLeftSideBarContent}
                setShortestPath={setShortestPath}
            />
            <GraphContainer selectedGraph={selectedGraph} shortestPath={shortestPath}/>
            <RightSidebar
                isOpen={isRightSidebarOpen}
                onClose={() => setIsRightSidebarOpen(false)}
                userName={selectedUserName}
            />
        </div>
    );
}
