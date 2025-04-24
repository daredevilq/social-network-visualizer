'use client';

import GraphTypeContent from "@/app/component/LeftSideBar/GraphTypeContent";
import FunctionsContent from "@/app/component/LeftSideBar/FunctionsContent";
import FiltersContent from "@/app/component/LeftSideBar/FiltersContent";
import HelpContent from "@/app/component/LeftSideBar/HelpContent";
import SettingsContent from "@/app/component/LeftSideBar/SettingsContent";
import ProjectsContent from "@/app/component/LeftSideBar/ProjectsContent";
import HomeContent from "@/app/component/LeftSideBar/HomeContent";

interface LeftSidebarProps {
    isOpen: boolean;
    selectedGraph: string;
    setSelectedGraph: (graph: string) => void;
    selectedLeftSideBarContent: string;
    setShortestPath: (value: (((prevState: string[]) => string[]) | string[])) => void;
}

export default function LeftSidebar({
                                        isOpen,
                                        selectedGraph,
                                        setSelectedGraph,
                                        selectedLeftSideBarContent,
                                        setShortestPath
                                    }: LeftSidebarProps) {
    const renderLeftSideBarContent = () => {
        switch (selectedLeftSideBarContent) {
            case "home":
                return <HomeContent/>;
            case "graph":
                return <GraphTypeContent selectedGraph={selectedGraph} setSelectedGraph={setSelectedGraph}/>
            case "functions":
                return <FunctionsContent setShortestPath={setShortestPath}/>
            case "filters":
                return <FiltersContent/>
            case "projects":
                return <ProjectsContent/>
            case "help":
                return <HelpContent/>
            case "settings":
                return <SettingsContent/>
            default:
                return <HomeContent/>;
        }
    };
    return (
        <div
            className={`fixed top-0 left-[3vw] h-screen w-full sm:w-80 text-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out p-2 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } border-r-[1px] border-[#FAFAFA] rounded-tr-[5%] rounded-br-[5%] bg-[#262631]`}
        >
            {renderLeftSideBarContent()}
        </div>
    );
}