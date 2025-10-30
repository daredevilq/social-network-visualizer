'use client';
import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Banner, { BannerType } from '@/app/components/Popups/Banner';

interface NotificationContextType {
  showNotification: (message: string, type: BannerType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{
    message: string;
    type: BannerType;
  } | null>(null);

  const showNotification = (message: string, type: BannerType = BannerType.INFO) => {
    setNotification(null);
    setTimeout(() => setNotification({ message, type }), 0);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <AnimatePresence>
        {notification && (
          <Banner message={notification.message} type={notification.type} duration={3000} onClose={() => setNotification(null)} />
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
