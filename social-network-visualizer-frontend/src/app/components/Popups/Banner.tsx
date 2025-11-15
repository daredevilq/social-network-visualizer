'use client';
import { motion } from 'framer-motion';
import { useEffect, ReactNode } from 'react';
import { ErrorIcon, SuccessIcon, WarningIcon } from '@/app/components/icons/Icons';
import { InfoIcon } from 'lucide-react';

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
