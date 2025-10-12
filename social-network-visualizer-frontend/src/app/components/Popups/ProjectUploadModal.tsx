"use client";

import { useRef, useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useNotification } from "@/app/context/NotificationProvider";
import { BannerType } from "@/app/components/Popups/Banner";
import AdvancedConfigModal from "@/app/components/Popups/AdvancedConfigModal";
import type { ProjectConfigDto } from "@/app/interface/ConfigInterface";
import { Settings } from "lucide-react";
import { useDefaultMetricsConfig } from "@/app/hooks/useDefaultMetricsConfig";

interface ProjectUploadModalProps {
    API: string;
    open: boolean;
    defaultName: string;
    pendingFiles: File[];
    onCancel: () => void;
    onFilesChange: (files: File[]) => void;
    onSuccess: (name: string) => void;
}

export default function ProjectUploadModal({
    API,
    open,
    defaultName = "",
    pendingFiles,
    onCancel,
    onFilesChange,
    onSuccess,
}: ProjectUploadModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null!);
    const [projectName, setProjectName] = useState<string>(defaultName);
    const [isNameError, setIsNameError] = useState(false);
    const [isFileError, setIsFileError] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState("");
    const [fileErrorMessage, setFileErrorMessage] = useState("");
    const { showNotification } = useNotification();
    const [config, setConfig] = useState<ProjectConfigDto | null>(null);
    const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
    const {defaultMetrics, loading: loadingDefaults, fetchDefaultConfig,} = useDefaultMetricsConfig(true);
    const [hasFetchedDefaults, setHasFetchedDefaults] = useState(false);

    useEffect(() => {
        if (open && !hasFetchedDefaults) {
            fetchDefaultConfig();
            setHasFetchedDefaults(true);
        }
    }, [open, hasFetchedDefaults, fetchDefaultConfig]);

    useEffect(() => {
        if (open) {
            setProjectName("");
            setIsNameError(false);
            setIsFileError(false);
            setNameErrorMessage("");
            setFileErrorMessage("");
            setShowAdvancedConfig(false);
        }
    }, [open]);

    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            onFilesChange([...pendingFiles, ...filesArray]);
            e.target.value = "";
            setIsFileError(false);
            setFileErrorMessage("");
        }
    };

    const handleUpload = async () => {
        const trimmedName = projectName.trim();

        setIsNameError(false);
        setIsFileError(false);
        setNameErrorMessage("");
        setFileErrorMessage("");

        let hasError = false;

        if (!trimmedName) {
            setNameErrorMessage("Please enter a project name.");
            setIsNameError(true);
            hasError = true;
        }

        if (pendingFiles.length === 0) {
            setFileErrorMessage("Please add at least one file.");
            setIsFileError(true);
            hasError = true;
        }

        if (hasError) return;

        const formData = new FormData();

        // Use config from ConfigForm if available, otherwise use default
        let finalConfig: ProjectConfigDto;
        if (config) {
            finalConfig = {
                ...config,
                projectName: trimmedName,
                createdAt: new Date().toISOString(),
            };
        } else {
            finalConfig = {
                projectName: trimmedName,
                createdAt: new Date().toISOString(),
                metrics: [...defaultMetrics],
            };
        }

        formData.append(
            "config",
            new Blob([JSON.stringify(finalConfig)], {
                type: "application/json",
            })
        );

        pendingFiles.forEach((file) => formData.append("files", file));

        try {
            const response = await fetch(`${API}/project/create-new`, {
                method: "POST",
                body: formData,
            } as RequestInit);

            const text = await response.text();
            if (!response.ok) {
                let message = "Upload failed.";
                try {
                    const json = JSON.parse(text);
                    if (json.error) message = json.error;
                } catch {}

                if (message.includes("already exists")) {
                    setNameErrorMessage(
                        `Project with name '${trimmedName}' already exists.`
                    );
                    setIsNameError(true);
                } else {
                    setFileErrorMessage(message);
                    setIsFileError(true);
                }
                throw new Error(message);
            }

            onSuccess(trimmedName);
            setProjectName("");
            onFilesChange([]);
            setConfig(null);
            showNotification(
                `Project '${trimmedName}' uploaded successfully.`,
                BannerType.SUCCESS
            );
        } catch (err: any) {
            console.error("Upload error:", err);
            showNotification(err.message || "Upload failed.", BannerType.ERROR);
        }
    };

    const removeFile = (index: number) => {
        const updatedFiles = [...pendingFiles];
        updatedFiles.splice(index, 1);
        onFilesChange(updatedFiles);
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            {open && (
                <div
                    className="fixed inset-0 bg-black/50"
                    aria-hidden="true"
                    onClick={onCancel}
                />
            )}

            <div
                className="fixed inset-0 bg-black/50"
                aria-hidden="true"
                onClick={onCancel}
            />

            <div
                className="bg-[#262631] rounded-xl p-6 w-full max-w-md z-50 relative shadow-xl text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <Dialog.Title className="text-2xl font-bold text-center mb-4">
                    Upload New Project
                </Dialog.Title>

                <input
                    value={projectName}
                    onChange={(e) => {
                        setProjectName(e.target.value);
                        setIsNameError(false);
                        setNameErrorMessage("");
                    }}
                    placeholder="Project name"
                    className={`w-full mb-4 p-2 rounded placeholder:text-gray-400 bg-transparent border ${
                        isNameError ? "border-red-500" : "border-gray-600"
                    }`}
                />
                {isNameError && (
                    <p className="text-red-400 text-sm mb-2">
                        {nameErrorMessage}
                    </p>
                )}

                <div
                    className={`mb-4 p-2 rounded ${
                        isFileError
                            ? "border-2 border-red-300"
                            : "border-2 border-gray-600"
                    }`}
                >
                    <p className="font-semibold mb-1">Selected files:</p>
                    <ul className="max-h-32 overflow-y-auto text-sm list-disc list-inside bg-[#30303d] p-2 rounded">
                        {pendingFiles.length === 0 ? (
                            <li className="italic text-gray-400">
                                No files added yet. Please select files.
                            </li>
                        ) : (
                            pendingFiles.map((file, idx) => (
                                <li
                                    key={idx}
                                    className="flex justify-between items-center"
                                >
                                    <span>{file.name}</span>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="text-red-400 hover:text-red-500 ml-2"
                                    >
                                        ✖
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                {isFileError && (
                    <p className="text-red-400 text-sm mb-3">
                        {fileErrorMessage}
                    </p>
                )}

                <div className="mb-4 flex items-center justify-between p-3 bg-[#30303d] rounded-lg border border-gray-600">
                    <div>
                        <p className="text-sm font-medium text-gray-200">
                            Metrics Configuration
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 mr-5">
                            {loadingDefaults
                                ? "Loading default configuration..."
                                : "Default: PAGERANK, COMMUNITY with AUTHOR nodes and MENTIONS relations"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAdvancedConfig(true)}
                        disabled={loadingDefaults}
                        className={`px-4 py-2 rounded text-black ${
                            loadingDefaults
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-gray-300 hover:bg-gray-400"
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
                    >
                        Add files
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".json"
                        onChange={handleFilesSelected}
                        className="hidden"
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            setIsFileError(false);
                            setIsNameError(false);
                            setNameErrorMessage("");
                            setFileErrorMessage("");
                            setConfig(null);
                            onCancel();
                        }}
                        className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        className="px-4 py-2 rounded bg-[#7140F4] hover:bg-[#5b30c9]"
                    >
                        Upload
                    </button>
                </div>
            </div>

            <AdvancedConfigModal
                open={showAdvancedConfig}
                onClose={() => setShowAdvancedConfig(false)}
                projectName={projectName.trim()}
                currentConfig={config}
                defaultMetricsConfig={defaultMetrics}
                onChange={(cfg) => setConfig(cfg)}
            />
        </Dialog>
    );
}
