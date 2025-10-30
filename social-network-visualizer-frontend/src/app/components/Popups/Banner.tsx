'use client';
import { motion } from 'framer-motion';
import { useEffect, ReactNode } from 'react';

export enum BannerType {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}

interface BannerProps {
  message: string;
  type: BannerType;
  duration?: number;
  onClose?: () => void;
}

const SuccessIcon = () => (
  <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-6 h-6 text-[#8B0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);

const InfoIcon = () => (
  <svg className="w-6 h-6 text-[#5C37E6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6 text-[#FF9F40]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    ></path>
  </svg>
);

interface TypeStyle {
  borderColor: string;
  icon: ReactNode;
}

const typeStyles: Record<string, TypeStyle> = {
  error: {
    borderColor: `border-[#8B0000]`,
    icon: <ErrorIcon />,
  },
  success: {
    borderColor: `border-[#22C55E]`,
    icon: <SuccessIcon />,
  },
  info: {
    borderColor: `border-[#5C37E6]`,
    icon: <InfoIcon />,
  },
  warning: {
    borderColor: `border-[#FF9F40]`,
    icon: <WarningIcon />,
  },
};

export default function Banner({ message, type = BannerType.INFO, duration = 3000, onClose }: BannerProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      transition={{ duration: 0.3 }}
      className={`fixed top-5 left-1/2 flex items-center gap-3 w-full max-w-md p-4 
                         bg-[#3A3A4A] text-white rounded-md shadow-md border-l-4 ${styles.borderColor}
                         cursor-pointer z-50`}
      onClick={onClose}
    >
      <div>{styles.icon}</div>
      <span className="font-semibold text-sm">{message}</span>
    </motion.div>
  );
}
