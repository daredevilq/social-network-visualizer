'use client';

import { Dialog } from '@headlessui/react';
import { GraphNode } from '@/types/GraphTypes';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useGraph } from '@/app/context/GraphContext';

interface ShortestPathModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onFind: (source: GraphNode, target: GraphNode) => void;
}

export default function ShortestPathModal({ isOpen, onCancel, onFind }: ShortestPathModalProps) {
  const { graphData } = useGraph();

  const [sourceInput, setSourceInput] = useState('');
  const [targetInput, setTargetInput] = useState('');

  const [sourceNode, setSourceNode] = useState<GraphNode | null>(null);
  const [targetNode, setTargetNode] = useState<GraphNode | null>(null);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isDropdownVisible, setDropdownVisible] = useState<'source' | 'target' | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<GraphNode[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSourceInput('');
      setTargetInput('');
      setSourceNode(null);
      setTargetNode(null);
      setDropdownVisible(null);
      setFilteredNodes([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  const filterNodes = (value: string) => {
    const query = value.toLowerCase().trim();
    if (!query) return [];

    return graphData.nodes.filter(
      (node) => node.name.toLowerCase().includes(query) || (node.nodeType && node.nodeType.toLowerCase().includes(query))
    );
  };

  const handleInputChange = (value: string, type: 'source' | 'target') => {
    setActiveIndex(-1);
    setDropdownVisible(type);

    if (type === 'source') {
      setSourceInput(value);
      setSourceNode(null);
    } else {
      setTargetInput(value);
      setTargetNode(null);
    }
    setFilteredNodes(filterNodes(value));
  };

  const pickNode = (node: GraphNode, type: 'source' | 'target') => {
    const display = node.name;

    if (type === 'source') {
      setSourceNode(node);
      setSourceInput(display);
    } else {
      setTargetNode(node);
      setTargetInput(display);
    }

    setDropdownVisible(null);
    setFilteredNodes([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, type: 'source' | 'target') => {
    if (!isDropdownVisible) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredNodes.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) pickNode(filteredNodes[activeIndex], type);
    } else if (e.key === 'Escape') {
      setDropdownVisible(null);
    }
  };

  const handleFind = () => {
    if (!sourceNode || !targetNode) return;
    onFind(sourceNode, targetNode);
    onCancel();
  };

  return (
    <Dialog open={isOpen} onClose={onCancel} className="fixed inset-0 z-50 flex items-center justify-center">
      {isOpen && <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={onCancel} />}

      <div className="bg-[#262631] rounded-xl p-6 w-full max-w-2xl z-50 shadow-xl text-white" onClick={(e) => e.stopPropagation()}>
        <Dialog.Title className="text-2xl font-bold text-center mb-2">Find shortest path</Dialog.Title>
        <p className="text-center text-gray-300 mb-6 text-sm">Select two nodes to compute the shortest connecting path</p>

        <div className="grid grid-cols-2 gap-4 mb-6 min-h-[85px]">
          <div className="relative">
            <label className="text-sm mb-1 block">Source</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full h-10 pl-10 pr-8 text-black bg-white rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Search node..."
                value={sourceInput}
                onChange={(e) => handleInputChange(e.target.value, 'source')}
                onKeyDown={(e) => handleKeyDown(e, 'source')}
                onFocus={() => isDropdownVisible !== 'source' && setDropdownVisible('source')}
              />

              {sourceInput && (
                <X
                  className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() => {
                    setSourceInput('');
                    setSourceNode(null);
                    setFilteredNodes([]);
                    setDropdownVisible(null);
                  }}
                />
              )}

              {sourceNode && <div className="text-xs text-gray-500 mt-1 ml-1">{sourceNode.nodeType}</div>}
            </div>

            {isDropdownVisible === 'source' && filteredNodes.length > 0 && (
              <ul ref={listRef} className="absolute mt-1 w-full bg-white text-black rounded-md shadow max-h-60 overflow-auto z-20">
                {filteredNodes.map((node, index) => {
                  const text = node.name;
                  const query = sourceInput.toLowerCase();
                  const idx = text.toLowerCase().indexOf(query);
                  const before = text.slice(0, idx);
                  const match = text.slice(idx, idx + query.length);
                  const after = text.slice(idx + query.length);
                  const active = index === activeIndex;

                  return (
                    <li
                      key={node.id}
                      onClick={() => pickNode(node, 'source')}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`px-4 py-2 cursor-pointer ${active ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                    >
                      <span className="text-sm">
                        {before}
                        <span className="font-semibold text-indigo-600">{match}</span>
                        {after}
                      </span>
                      <div className="text-xs text-gray-500">{node.nodeType}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="text-sm mb-1 block">Target</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full h-10 pl-10 pr-8 text-black bg-white rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Search node..."
                value={targetInput}
                onChange={(e) => handleInputChange(e.target.value, 'target')}
                onKeyDown={(e) => handleKeyDown(e, 'target')}
                onFocus={() => isDropdownVisible !== 'target' && setDropdownVisible('target')}
              />

              {targetInput && (
                <X
                  className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() => {
                    setTargetInput('');
                    setTargetNode(null);
                    setFilteredNodes([]);
                    setDropdownVisible(null);
                  }}
                />
              )}
              {targetNode && <div className="text-xs text-gray-500 mt-1 ml-1">{targetNode.nodeType}</div>}
            </div>

            {isDropdownVisible === 'target' && filteredNodes.length > 0 && (
              <ul ref={listRef} className="absolute mt-1 w-full bg-white text-black rounded-md shadow max-h-60 overflow-auto z-20">
                {filteredNodes.map((node, index) => {
                  const text = node.name;
                  const query = targetInput.toLowerCase();
                  const idx = text.toLowerCase().indexOf(query);
                  const before = text.slice(0, idx);
                  const match = text.slice(idx, idx + query.length);
                  const after = text.slice(idx + query.length);
                  const active = index === activeIndex;

                  return (
                    <li
                      key={node.id}
                      onClick={() => pickNode(node, 'target')}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`px-4 py-2 cursor-pointer ${active ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                    >
                      <span className="text-sm">
                        {before}
                        <span className="font-semibold text-indigo-600">{match}</span>
                        {after}
                      </span>
                      <div className="text-xs text-gray-500">{node.nodeType}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-2">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 min-w-[100px] text-center">
            Cancel
          </button>

          <button
            onClick={handleFind}
            disabled={!sourceNode || !targetNode}
            className={`
            px-4 py-2 rounded min-w-[100px] text-center
            ${!sourceNode || !targetNode ? 'bg-[#a78bfa]/50 cursor-not-allowed' : 'bg-[#7140F4] hover:bg-[#5b30c9]'}
        `}
          >
            Find
          </button>
        </div>
      </div>
    </Dialog>
  );
}
