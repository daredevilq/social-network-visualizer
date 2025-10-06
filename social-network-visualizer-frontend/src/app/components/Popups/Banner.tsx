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
    error: "bg-red-700 text-white",
    success: "bg-green-700 text-white",
    info: "bg-blue-700 text-white",
    warning: "bg-yellow-700 text-black",
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
                         w-96 text-center z-50 ${typeStyles[type]}`}
            onClick={onClose}
        >
            {message}
        </motion.div>
    );
}
