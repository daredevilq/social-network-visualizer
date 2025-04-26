'use client';

import './globals.css'
import { ProjectProvider } from './context/ProjectContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<ProjectProvider>
					{children}
				</ProjectProvider>
			</body>
		</html>
	);
}
