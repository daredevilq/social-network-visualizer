'use client'
import { motion } from "framer-motion";
import { useEffect } from "react";

export enum BannerType {
    ERROR = "error",
    SUCCESS = "success",
    INFO = "info",
    WARNING = "warning",
}

interface BannerProps {
    message: string;
    type: BannerType;
    duration?: number;
    onClose?: () => void;
}

const typeStyles: Record<string, string> = {
    error: "bg-[#8B0000] text-[#FAFAFA]",
    success: "bg-[#5C37E6] text-[#FAFAFA]",
    info: "bg-[#5C37E6] text-[#FAFAFA]",
    warning: "bg-[#8B0000] text-[#FAFAFA]",
};

export default function Banner({ message, type = BannerType.INFO, duration = 3000, onClose }: BannerProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg cursor-pointer 
                         w-80 text-center z-50 font-sans font-bold ${typeStyles[type]}`}
            onClick={onClose}
        >
            {message}
        </motion.div>
    );
}
