import React, {useState, ChangeEvent, KeyboardEvent, useRef, useEffect} from 'react';
import {BarChart2, Search} from "lucide-react";
import {useProject} from "@/app/context/ProjectContext";
import {GraphData} from "@/app/interface/GraphData";

interface SearchAndToggleModeContainerProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
}

const SearchAndToggleModeContainer: React.FC<SearchAndToggleModeContainerProps> = ({
                                                                                       searchValue,
                                                                                       onSearchChange,
                                                                                       searchPlaceholder = "Search graph data...",
                                                                                   }) => {
    const [localSearchValue, setLocalSearchValue] = useState(searchValue || '');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const {isLabelsMode, setIsLabelsMode, graphData, setNodeIdFound, setShowLabels} = useProject();

    const toggleLabels = () => {
        setShowLabels((prev => !prev))
        const newValue = !isLabelsMode;
        setIsLabelsMode(newValue);
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsDropdownVisible(false);
                setActiveIndex(-1);
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const query = localSearchValue.trim().toLowerCase();
        if (query.length === 0) {
            setFilteredSuggestions([]);
            setIsDropdownVisible(false);
            setActiveIndex(-1);
            return;
        }
        const matches = graphData.nodes
            .map(node => node.id)
            .filter(name => name.toLowerCase().includes(query));

        setFilteredSuggestions(matches);
        setIsDropdownVisible(matches.length > 0);
        setActiveIndex(-1);
    }, [localSearchValue]);


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalSearchValue(e.target.value);
    };

    const selectSuggestion = (suggestion: string) => {
        setIsDropdownVisible(false);
        setActiveIndex(-1);
        setLocalSearchValue(suggestion);
        const node = findNodeById(graphData, suggestion);
        if (node) {
            setNodeIdFound(node.id);
            onSearchChange(suggestion);
        } else {
            setNodeIdFound(null);
            onSearchChange(suggestion);
        }
        return;
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isDropdownVisible) {
            if (e.key === 'Enter') {
                onSearchChange(localSearchValue);
                const node = findNodeById(graphData, localSearchValue);
                if (node) {
                    setNodeIdFound(node.id);
                } else {
                    setNodeIdFound(null);
                }
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
                selectSuggestion(filteredSuggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsDropdownVisible(false);
            setActiveIndex(-1);
        }
    };

    const findNodeById = (graphData: GraphData, searchId: string) => {
        return graphData.nodes.find(node => node.id === searchId);
    }

    return (
        <div className="fixed top-5 left-[5%] w-full max-w-3xl px-4 z-30" ref={containerRef}>
            <div className="rounded-lg shadow-lg p-3 flex items-center justify-between space-x-3 h-10">
                <div className="w-32 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#FAFAFA] text-center whitespace-nowrap">
                        {isLabelsMode ? "Labels Mode" : "No Labels Mode"}
                    </span>
                    <button
                        onClick={toggleLabels}
                        className="flex items-center justify-center mt-1 space-x-2 text-sm font-medium"
                        aria-label="Toggle display mode"
                    >
                        <div
                            className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                                isLabelsMode ? "bg-indigo-500" : "bg-gray-300"
                            } relative`}
                        >
            <span
                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    isLabelsMode ? "translate-x-6" : ""
                }`}
            />
                        </div>
                        <div className="flex sm:hidden ml-1">
                            {isLabelsMode ? (
                                <BarChart2 size={16} className="text-indigo-600"/>
                            ) : (
                                <BarChart2 size={16} className="text-gray-500"/>
                            )}
                        </div>
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400"/>
                    <input
                        type="text"
                        value={localSearchValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={searchPlaceholder}
                        className="w-full h-9 pl-10 pr-4 py-2 text-gray-800 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-[#FAFAFA]"
                    />

                    {/* Dropdown z suggestions */}
                    {isDropdownVisible && (
                        <ul className="absolute z-10 mt-1 w-full bg-[#FAFAFA] rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredSuggestions.map((suggestion, index) => {
                                const query = localSearchValue.trim().toLowerCase();
                                const lowerName = suggestion.toLowerCase();
                                const matchIndex = lowerName.indexOf(query);
                                const before = suggestion.slice(0, matchIndex);
                                const matchText = suggestion.slice(matchIndex, matchIndex + query.length);
                                const after = suggestion.slice(matchIndex + query.length);

                                const isActive = index === activeIndex;
                                return (
                                    <li
                                        key={suggestion}
                                        onClick={() => selectSuggestion(suggestion)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`
                    px-4 py-2 cursor-pointer flex items-center transition-colors duration-200
                    text-gray-800
                    ${isActive ? "bg-indigo-100" : ""}
                    hover:bg-indigo-100
                  `}
                                    >
                  <span>
                    {before}
                      <span className="font-semibold text-indigo-600">{matchText}</span>
                      {after}
                  </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchAndToggleModeContainer;


