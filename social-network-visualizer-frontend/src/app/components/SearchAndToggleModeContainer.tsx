import React, { useState, ChangeEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { BarChart2, Search, X } from 'lucide-react';
import { useProject } from '@/app/context/ProjectContext';
import { GraphData } from '@/app/interface/GraphData';
import { GraphNode } from '@/types/GraphTypes';
import { useGraph } from '@/app/context/GraphContext';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';

interface SearchAndToggleModeContainerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

const SearchAndToggleModeContainer: React.FC<SearchAndToggleModeContainerProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search graph data...',
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue || '');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<GraphNode[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isLabelsMode, setIsLabelsMode, projectData, nodeFound, setNodeFound, setShowLabels, loadedProjectName } = useProject();
  const { openedWorkspaceName, isInWorkspaceMode } = useWorkspace();
  const { addNodeToGraph, findNodeInProjectData } = useGraph();
  const { showNotification } = useNotification();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!loadedProjectName || !openedWorkspaceName) return;
    setLocalSearchValue('');
    setFilteredSuggestions([]);
    setIsDropdownVisible(false);
    setActiveIndex(-1);
    setNodeFound(null);
  }, [loadedProjectName, openedWorkspaceName]);

  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const activeItem = listRef.current.children[activeIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex]);

  const toggleLabels = () => {
    setShowLabels((prev) => !prev);
    const newValue = !isLabelsMode;
    setIsLabelsMode(newValue);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownVisible(false);
        setActiveIndex(-1);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const query = localSearchValue.trim().toLowerCase();
    if (!isDropdownVisible && nodeFound) return;

    if (query.length === 0) {
      setFilteredSuggestions([]);
      setIsDropdownVisible(false);
      setActiveIndex(-1);
      return;
    }

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      if (isInWorkspaceMode) {
        searchInAllData(query);
      } else {
        searchInLoadedData(query);
      }
      setActiveIndex(-1);
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [localSearchValue]);

  const searchInLoadedData = (query: string) => {
    const matches = projectData.nodes.filter(
      (node) => node.id.toLowerCase().includes(query) || node.nodeType.toLowerCase().includes(query)
    );

    setFilteredSuggestions(matches);
    setIsDropdownVisible(matches.length > 0);
  };

  const searchInAllData = async (query: string) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_BASE_URL}/graph/search?query=${query}`, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Network error');

      const data: GraphNode[] = await response.json();

      setFilteredSuggestions(data);
      setIsDropdownVisible(data.length > 0);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      showNotification('Search request failed', BannerType.ERROR);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value);
  };

  const selectSuggestion = (suggestion: GraphNode) => {
    setActiveIndex(-1);
    setIsDropdownVisible(false);

    const displayValue = suggestion.nodeType === 'TWEET' ? suggestion.content : suggestion.id;
    setLocalSearchValue(displayValue);

    if (isInWorkspaceMode) {
      setNodeFound(suggestion);
      addNodeToGraph(suggestion);
    } else {
      const node = findNodeByName(projectData, suggestion.id);
      if (node) {
        setNodeFound(node);
        findNodeInProjectData(node);
      } else {
        setNodeFound(null);
      }
    }

    onSearchChange(displayValue);
    setTimeout(() => setIsDropdownVisible(false), 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownVisible) {
      if (e.key === 'Enter') {
        if (nodeFound) {
          setNodeFound(null);
          setLocalSearchValue('');
          onSearchChange('');
          return;
        }

        onSearchChange(localSearchValue);
        const node = findNodeByName(projectData, localSearchValue);
        if (node) {
          setNodeFound(node);
          findNodeInProjectData(node);
        } else {
          setNodeFound(null);
        }
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
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

  const findNodeByName = (graphData: GraphData, searchId: string) => {
    return graphData.nodes.find((node: GraphNode) => node.id === searchId);
  };

  return (
    <div className="fixed top-5 left-[5%] w-full max-w-3xl px-4 z-30" ref={containerRef}>
      <div className="rounded-lg p-3 flex items-center justify-between space-x-3 h-10">
        <div className="w-32 flex flex-col items-center justify-center">
          <span className="text-xs text-[#FAFAFA] text-center whitespace-nowrap">{isLabelsMode ? 'Labels Mode' : 'No Labels Mode'}</span>
          <button
            onClick={toggleLabels}
            className="flex items-center justify-center mt-1 space-x-2 text-sm font-medium"
            aria-label="Toggle display mode"
          >
            <div
              className={`w-12 h-6 rounded-full transition-colors duration-300 ${isLabelsMode ? 'bg-indigo-500' : 'bg-gray-300'} relative`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  isLabelsMode ? 'translate-x-6' : ''
                }`}
              />
            </div>
            <div className="flex sm:hidden ml-1">
              {isLabelsMode ? <BarChart2 size={16} className="text-indigo-600" /> : <BarChart2 size={16} className="text-gray-500" />}
            </div>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={localSearchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-10 pr-8 py-2 text-gray-800 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-[#FAFAFA]"
          />

          {localSearchValue && (
            <button
              onClick={() => {
                setLocalSearchValue('');
                setFilteredSuggestions([]);
                setIsDropdownVisible(false);
                setNodeFound(null);
                onSearchChange('');
              }}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {/* Dropdown */}
          {isDropdownVisible && (
            <ul ref={listRef} className="absolute z-10 mt-1 w-full bg-[#FAFAFA] rounded-md shadow-g max-h-60 overflow-auto">
              {filteredSuggestions.map((suggestion, index) => {
                const value = suggestion.nodeType === 'TWEET' ? suggestion.content : suggestion.id;
                const query = localSearchValue.trim().toLowerCase();
                const lowerName = value.toLowerCase();
                const matchIndex = lowerName.indexOf(query);
                const before = value.slice(0, matchIndex);
                const matchText = value.slice(matchIndex, matchIndex + query.length);
                const after = value.slice(matchIndex + query.length);
                const isActive = index === activeIndex;

                return (
                  <li
                    key={`${suggestion.id}-${suggestion.nodeType}`}
                    onClick={() => selectSuggestion(suggestion)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`px-4 py-2 cursor-pointer flex flex-col transition-colors duration-200 text-gray-800 ${
                      isActive ? 'bg-indigo-100' : ''
                    } hover:bg-indigo-100`}
                  >
                    <span className="text-sm">
                      {before}
                      <span className="font-semibold text-indigo-600">{matchText}</span>
                      {after}
                    </span>

                    {suggestion.nodeType && <span className="text-xs text-gray-500 mt-0.5">{suggestion.nodeType}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndToggleModeContainer;
