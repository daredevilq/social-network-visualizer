'use client';

import React from 'react';
import { ProviderComposer } from './ProviderComposer';
import { NotificationProvider } from '@/app/context/NotificationProvider';
import { ProjectProvider } from '@/app/context/ProjectContext';
import { WorkspaceProvider } from '@/app/context/WorkspaceContext';
import { GraphProvider } from '@/app/context/GraphContext';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProviderComposer
            providers={[
                NotificationProvider,
                ProjectProvider,
                WorkspaceProvider,
                GraphProvider,
            ]}
        >
            {children}
        </ProviderComposer>
    );
};
