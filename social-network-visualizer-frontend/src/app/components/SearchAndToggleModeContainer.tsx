import React, { useState } from 'react';
import { BarChart2, Search } from "lucide-react";
import {useProject} from "@/app/context/ProjectContext";
import {GraphData} from "@/app/interface/GraphData";

const SearchAndToggleModeContainer = ({searchValue, onSearchChange, searchPlaceholder = "Search graph data...",}) => {
    const [localSearchValue, setLocalSearchValue] = useState(searchValue || '');
    const {isGraphMode, setIsGraphMode, graphData, setNodeIdFound} = useProject();
    const handleDisplayModeToggle = () => {
        const newValue = !isGraphMode;
        setIsGraphMode(newValue);
    };

    const handleInputChange = (e) => {
        setLocalSearchValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearchChange(localSearchValue);
            const node = findNodeById(graphData, localSearchValue);
            if (node) {
                setNodeIdFound(node.id);
            } else {
                setNodeIdFound(null);
            }
        }
    };

    const findNodeById = (graphData: GraphData, searchId: string) => {
        return graphData.nodes.find(node => node.id === searchId);
    }

    return (
        <div className="fixed top-4 left-1/4 right-0 w-full max-w-2xl px-4 z-30">
            <div className="rounded-lg shadow-lg p-3 flex items-center justify-between space-x-3 h-10">

                <div className="w-32 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-700 dark:text-gray-300 text-center whitespace-nowrap">
                        {isGraphMode ? 'Graph Mode' : 'Analysis Mode' }
                    </span>
                    <button
                        onClick={handleDisplayModeToggle}
                        className="flex items-center justify-center mt-1 space-x-2 text-sm font-medium"
                        aria-label="Toggle display mode"
                    >
                        <div className={`w-12 h-6 rounded-full transition duration-300 ${
                            !isGraphMode ? 'bg-[#7140F4]' : 'bg-gray-300'
                        } relative`}>
                            <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                isGraphMode ? 'translate-x-6' : ''
                            }`} />
                        </div>
                        <div className="flex sm:hidden ml-1">
                            {!isGraphMode ? (
                                <BarChart2 size={16} className="text-indigo-500" />
                            ) : (
                                <BarChart2 size={16} className="text-gray-500" />
                            )}
                        </div>
                    </button>
                </div>

                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-black-400" />
                    <input
                        type="text"
                        value={localSearchValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 text-gray-800 dark:text-black-200 placeholder-white-500 dark:placeholder-black-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-[#FAFAFA]"
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchAndToggleModeContainer;


