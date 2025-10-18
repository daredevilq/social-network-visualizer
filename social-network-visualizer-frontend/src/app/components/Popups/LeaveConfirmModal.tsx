'use client'

import React from "react"
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface LeaveConfirmModalProps {
    open: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
}

export default function LeaveConfirmModal({ open, onSave, onDiscard, onCancel }: LeaveConfirmModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            <div className="fixed inset-0 bg-black/50" />

            <div className="relative bg-[#262631] rounded-xl p-6 w-full max-w-md z-50 shadow-xl text-white">
                <button
                    onClick={onCancel}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <Dialog.Title className="text-2xl font-bold mb-4 text-center">
                    Confirm Action
                </Dialog.Title>

                <p className="mb-6 text-center text-gray-300">
                    You have unsaved changes. What do you want to do?
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onSave}
                        className="px-4 py-2 rounded-md bg-[#7140F4] hover:bg-[#5b30c9] transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={onDiscard}
                        className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        Discard
                    </button>
                </div>
            </div>
        </Dialog>
    )
}
