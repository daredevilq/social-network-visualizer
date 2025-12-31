'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import AdvancedConfigModal from '@/app/components/Popups/AdvancedConfigModal';
import { useDefaultMetricsConfig } from '@/app/hooks/useDefaultMetricsConfig';
import { ProjectConfig } from '@/types/GraphTypes';
import { Settings, UploadCloud, FileJson, Trash2 } from 'lucide-react';
import PopoverIcon from '@/app/components/Popups/PopoverIcon';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';

interface ProjectUploadModalProps {
  open: boolean;
  defaultName: string;
  pendingFiles: File[];
  onCancel: () => void;
  onFilesChange: (files: File[]) => void;
  onSuccess: (name: string) => void;
}

export default function ProjectUploadModal({
  open,
  defaultName = '',
  pendingFiles,
  onCancel,
  onFilesChange,
  onSuccess,
}: ProjectUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectName, setProjectName] = useState<string>(defaultName);

  const [isNameError, setIsNameError] = useState(false);
  const [isFileError, setIsFileError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [fileErrorMessage, setFileErrorMessage] = useState('');

  const [isDragging, setIsDragging] = useState(false);

  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const { defaultMetrics, loading: loadingDefaults } = useDefaultMetricsConfig();
  const { showNotification } = useNotification();
  const INVALID_NAME_CHARS = /[\/.#$%&*?<>\\|]/;
  const INVALID_NAME_CHARS_LIST = '/ . # $ % & * ? < > \\ |';

  useEffect(() => {
    if (open) {
      setProjectName('');
      setIsNameError(false);
      setIsFileError(false);
      setNameErrorMessage('');
      setFileErrorMessage('');
      setConfig(null);
      setShowAdvancedConfig(false);
      setIsDragging(false);
    }
  }, [open]);

  useEffect(() => {
    if (defaultMetrics.length > 0 && !config) {
      setConfig({ metrics: defaultMetrics });
    }
  }, [defaultMetrics, config]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = ''; // Reset input
    }
  };

  const processFiles = (newFiles: File[]) => {
    const jsonFiles = newFiles.filter((f) => f.name.toLowerCase().endsWith('.json'));

    if (jsonFiles.length !== newFiles.length) {
      showNotification('Some files were ignored. Only .json files are allowed.', BannerType.WARNING);
    }

    if (jsonFiles.length > 0) {
      onFilesChange([...pendingFiles, ...jsonFiles]);
      setIsFileError(false);
      setFileErrorMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async () => {
    const trimmedName = projectName.trim();
    let hasError = false;

    setIsNameError(false);
    setIsFileError(false);

    if (!trimmedName) {
      setNameErrorMessage('Please enter a project name.');
      setIsNameError(true);
      hasError = true;
    }

    if (INVALID_NAME_CHARS.test(trimmedName)) {
      setNameErrorMessage(`Project name contains invalid characters: ${INVALID_NAME_CHARS_LIST}`);
      setIsNameError(true);
      hasError = true;
    }

    if (pendingFiles.length === 0) {
      setFileErrorMessage('Please add at least one JSON file.');
      setIsFileError(true);
      hasError = true;
    }

    if (hasError) return;

    const formData = new FormData();
    pendingFiles.forEach((file) => formData.append('files', file));

    if (config) {
      formData.append('config', JSON.stringify(config));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/project/${trimmedName}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let msg = text;

        try {
          const json = JSON.parse(text);
          msg = json.error || text;
        } catch {}

        showNotification(msg, BannerType.ERROR);
        throw new Error(msg);
      }

      onSuccess(trimmedName);
    } catch (err: any) {
      if (!err.message) showNotification('Failed to upload project', BannerType.ERROR);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...pendingFiles];
    updatedFiles.splice(index, 1);
    onFilesChange(updatedFiles);
  };

  const handleConfigChange = useCallback((cfg: ProjectConfig) => {
    setConfig(cfg);
  }, []);

  const scrollbarClass = `
    [scrollbar-width:thin] [scrollbar-color:#7140F4_transparent]
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#7140F4] [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-[#5a33c4]
  `;

  return (
    <>
      <Dialog open={open && !showAdvancedConfig} onClose={onCancel} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-[#262631] p-6 text-left align-middle shadow-2xl transition-all border border-gray-700">
            <Dialog.Title className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-[#7140F4]" />
              Upload New Project
            </Dialog.Title>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Project Name</label>
              <input
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (isNameError) setIsNameError(false);
                }}
                placeholder="My Graph Project"
                className={`w-full p-2.5 rounded-lg bg-[#30303d] text-white placeholder:text-gray-500 border focus:outline-none transition-colors
                    ${isNameError ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#7140F4]'}`}
              />
              {isNameError && <p className="text-red-400 text-xs mt-1 ml-1">{nameErrorMessage}</p>}
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-400">Source Files (.json)</label>
                <span className="text-xs text-gray-500">{pendingFiles.length} files selected</span>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-all flex flex-col items-center justify-center text-center min-h-[120px] cursor-pointer
                    ${
                      isDragging
                        ? 'border-[#7140F4] bg-[#7140F4]/10'
                        : isFileError
                          ? 'border-red-500 bg-red-500/5'
                          : 'border-gray-600 bg-[#30303d] hover:border-gray-500'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (pendingFiles.length === 0) fileInputRef.current?.click();
                }}
              >
                {pendingFiles.length === 0 ? (
                  <div className="flex flex-col items-center pointer-events-none">
                    <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-[#7140F4]' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-300">Drag & drop JSON files here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                  </div>
                ) : (
                  <ul className={`w-full max-h-[120px] overflow-y-auto pr-1 space-y-1 text-left ${scrollbarClass} cursor-default`}>
                    {pendingFiles.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center bg-[#262631] px-2 py-1.5 rounded border border-gray-700/50 group hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileJson className="w-4 h-4 text-[#7140F4] shrink-0" />
                          <span className="text-sm text-gray-200 truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <input ref={fileInputRef} type="file" multiple accept=".json" onChange={handleFilesSelected} className="hidden" />
              </div>

              {isFileError && <p className="text-red-400 text-xs mt-1 ml-1">{fileErrorMessage}</p>}

              {pendingFiles.length > 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#7140F4] hover:text-[#8b61ff] font-medium mt-2 flex items-center gap-1 ml-1 cursor-pointer"
                >
                  + Add more files
                </button>
              )}
            </div>

            <div className="mb-6 p-3 bg-[#30303d] rounded-lg border border-gray-700 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
                  <Settings className="w-4 h-4 text-gray-400" />
                  Metrics Configuration
                  <PopoverIcon message="Configure which metrics will be computed for your project." scale={1.0} position="top" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] leading-tight">
                  {loadingDefaults ? 'Loading...' : 'Default: PAGERANK, COMMUNITY...'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedConfig(true)}
                disabled={loadingDefaults}
                className="px-3 py-1.5 text-xs font-medium rounded bg-[#262631] border border-gray-600 hover:bg-gray-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Configure
              </button>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#7140F4] hover:bg-[#5b30c9] text-white shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <AdvancedConfigModal
        open={showAdvancedConfig}
        onClose={() => setShowAdvancedConfig(false)}
        projectName={projectName.trim()}
        currentConfig={config}
        defaultMetricsConfig={defaultMetrics}
        onChange={handleConfigChange}
      />
    </>
  );
}
