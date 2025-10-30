"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { HelpCircle } from "lucide-react";
import { marked } from "marked";

interface PopoverIconProps {
  message: string;
  scale?: number;
  position?: "top" | "bottom" | "left" | "right";
}

export default function PopoverIcon(props: PopoverIconProps) {
  const { message, scale = 1, position = "bottom" } = props;
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[position];

  const arrowClasses = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-x-8 border-x-transparent border-t-8 border-t-white",
    bottom:
      "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-x-8 border-x-transparent border-b-8 border-b-white",
    left: "right-0 top-1/2 -translate-y-1/2 translate-x-full border-y-8 border-y-transparent border-l-8 border-l-white",
    right:
      "left-0 top-1/2 -translate-y-1/2 -translate-x-full border-y-8 border-y-transparent border-r-8 border-r-white",
  }[position];

  return (
    <div ref={ref} className="relative inline-block m-1">
      <motion.div
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: hover ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="cursor-pointer"
      >
        <HelpCircle
          size={scale * 16}
          className={`stroke-current transition-colors duration-200 ${
            open
              ? "text-[#7140F4]"
              : hover
                ? "text-[#7140F4]"
                : "text-[#FAFAFA]"
          }`}
        />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === "top" ? 8 : -8 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-20 w-max max-w-xs rounded-2xl bg-white p-3 text-sm text-gray-700 shadow-lg border border-gray-200 ${positionClasses}`}
          >
            <div
              className="prose prose-sm prose-gray text-justify"
              dangerouslySetInnerHTML={{ __html: marked(message) }}
            />
            <div className={`absolute w-0 h-0 ${arrowClasses}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
