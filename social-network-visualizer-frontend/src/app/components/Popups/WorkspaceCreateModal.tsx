'use client';

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface WorkspaceCreateModalProps {
    open: boolean;
    projectName: string;
    onCancel: () => void;
    handleCreateWorkspace: (workspaceName: string) => void;
    workspaceList: string[];
}

export default function WorkspaceCreateModal(props: WorkspaceCreateModalProps) {
    const { open, projectName, onCancel, handleCreateWorkspace, workspaceList } = props;
    const [workspaceName, setWorkspaceName] = useState("");
    const [isNameError, setIsNameError] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState("");

    useEffect(() => {
        if (open) {
            setWorkspaceName("");
            setIsNameError(false);
            setNameErrorMessage("");
        }
    }, [open]);

    const handleCreate = async () => {
        const trimmedName = workspaceName.trim();

        setIsNameError(false);
        setNameErrorMessage("");

        if (!trimmedName) {
            setIsNameError(true);
            setNameErrorMessage("Please enter a workspace name.");
            return;
        }

        const nameExists = workspaceList.some(
            (workspace) => workspace.toLowerCase() === trimmedName.toLowerCase()
        );

        if (nameExists) {
            setIsNameError(true);
            setNameErrorMessage("A workspace with this name already exists.");
            return;
        }

        handleCreateWorkspace(trimmedName);
        setWorkspaceName("");
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
                className="bg-[#262631] rounded-xl p-6 w-full max-w-md z-50 relative shadow-xl text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <Dialog.Title className="text-2xl font-bold text-center mb-4">
                    Create Workspace
                </Dialog.Title>

                <input
                    value={workspaceName}
                    onChange={(e) => {
                        setWorkspaceName(e.target.value);
                        setIsNameError(false);
                        setNameErrorMessage("");
                    }}
                    placeholder="Workspace name"
                    className={`w-full mb-3 p-2 rounded placeholder:text-gray-400 bg-transparent border ${
                        isNameError ? "border-red-500" : "border-gray-600"
                    }`}
                />
                {isNameError && (
                    <p className="text-red-400 text-sm mb-3">{nameErrorMessage}</p>
                )}

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 rounded bg-[#7140F4] hover:bg-[#5b30c9]"
                    >
                        Create
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
