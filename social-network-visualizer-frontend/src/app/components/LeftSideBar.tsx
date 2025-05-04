'use client';

import GraphTypeContent from "@/app/components/LeftSideBar/GraphTypeContent";
import FunctionsContent from "@/app/components/LeftSideBar/FunctionsContent";
import FiltersContent from "@/app/components/LeftSideBar/FiltersContent";
import HelpContent from "@/app/components/LeftSideBar/HelpContent";
import SettingsContent from "@/app/components/LeftSideBar/SettingsContent";
import ProjectsContent from "@/app/components/LeftSideBar/ProjectsContent";
import HomeContent from "@/app/components/LeftSideBar/HomeContent";

interface LeftSidebarProps {
    isOpen: boolean;
    selectedGraph: string;
    setSelectedGraph: (graph: string) => void;
    selectedLeftSideBarContent: string;
}

export default function LeftSidebar({
                                        isOpen,
                                        selectedGraph,
                                        setSelectedGraph,
                                        selectedLeftSideBarContent,
                                    }: LeftSidebarProps) {
    const renderLeftSideBarContent = () => {
        switch (selectedLeftSideBarContent) {
            case "home":
                return <HomeContent/>;
            case "graph":
                return <GraphTypeContent selectedGraph={selectedGraph} setSelectedGraph={setSelectedGraph}/>
            case "functions":
                return <FunctionsContent/>
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
            } border-r-[1px] border-[#FAFAFA] rounded-tr-2xl rounded-br-2xl bg-[#262631]`}
        >
            {renderLeftSideBarContent()}
        </div>
    );
}