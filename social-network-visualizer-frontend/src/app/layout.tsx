'use client';

import './globals.css'
import { ProjectProvider } from './context/ProjectContext'
import {NotificationProvider} from "@/app/context/NotificationProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<NotificationProvider>
					<ProjectProvider>
						{children}
					</ProjectProvider>
				</NotificationProvider>
			</body>
		</html>
	);
}
