'use client';

import './globals.css'
import { ProjectProvider } from './context/ProjectContext'
import {NotificationProvider} from "@/app/context/NotificationProvider";
import {WorkspaceProvider} from "@/app/context/WorkspaceContext";
import {GraphProvider} from "@/app/context/GraphContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<NotificationProvider>
					<ProjectProvider>
						<WorkspaceProvider>
							<GraphProvider>
								{children}
							</GraphProvider>
						</WorkspaceProvider>
					</ProjectProvider>
				</NotificationProvider>
			</body>
		</html>
	);
}
