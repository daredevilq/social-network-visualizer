'use client'
import { motion } from "framer-motion";
import { useEffect } from "react";

interface BannerProps {
    message: string;
    type: "error" | "success" | "info" | "warning";
    duration?: number;
    onClose?: () => void;
}

const typeStyles: Record<string, string> = {
    error: "bg-red-700 text-white",
    success: "bg-green-700 text-white",
    info: "bg-blue-700 text-white",
    warning: "bg-yellow-700 text-black",
};

export default function Banner({ message, type = "info", duration = 3000, onClose }: BannerProps) {
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
            className={`z-50 fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${typeStyles[type]}`}
        >
            {message}
        </motion.div>
    );
}
