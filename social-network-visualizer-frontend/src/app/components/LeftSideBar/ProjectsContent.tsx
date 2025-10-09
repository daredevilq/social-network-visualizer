'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import { ProjectSummary } from '@/app/interface/ProjectSummary';
import ProjectActionsMenu from '@/app/components/Popups/ProjectActionsMenu';
import ConfirmModal       from '@/app/components/Popups/ConfirmModal';
import ProjectUploadModal from '@/app/components/Popups/ProjectUploadModal';
import ProjectEditModal from '@/app/components/Popups/ProjectEditModal';
import {resetProjectName} from "@/app/project-state";
import {API_BASE_URL} from "@/app/configuration/urlConfig";
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";

export default function ProjectsContent() {
	const { loadedProjectName, loading, loadProject, runWithLoading, setGraphData } = useProject();
	const { showNotification } = useNotification()
	const [projects, setProjects] = useState<ProjectSummary[]>([]);
	const [workspaces, setWorkspaces] = useState<string[]>([]);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
	const [editTarget, setEditTarget] = useState<string|null>(null);
	const askDeleteProject = (name: string) => setDeleteTarget(name);
	const cancelCreateModal = () => { setCreateModalOpen(false); setPendingFiles([]); };

	const refreshProjects = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/project/list`);
			if (!res.ok) throw new Error("Failed to load project list");

			setProjects(await res.json());
		} catch (err: any) {
			showNotification(`Load error: ${err.message}`, BannerType.ERROR);
		}
	};

	const runDeleteProject = async (projectName: string) => {
		await runWithLoading(async () => {
			const res = await fetch(`${API_BASE_URL}/project/${encodeURIComponent(projectName)}`, { method: 'DELETE' });
			if (!res.ok) throw new Error("Failed to delete project");

			if (loadedProjectName === projectName) {
				await resetProjectName();
				refreshProjects();
				setGraphData({nodes: [], links: []});
			}
			showNotification(`Project “${projectName}” deleted`, BannerType.INFO);
		}).catch((err: any) => {
			showNotification(`Delete error: ${err.message}`, BannerType.ERROR);
		});
	};

	const handleProjectClick = async (projectName: string) => {
		await loadProject(projectName,true)
		await refreshWorkspaces(projectName);
	};

	const refreshWorkspaces = async (projectName: string) => {
		try {
			const res = await fetch(`${API_BASE_URL}/project/${projectName}/workspace/list`);
			if (!res.ok) throw new Error("Failed to load workspace list");
			setWorkspaces(await res.json());
		} catch (err: any) {
			showNotification(`Load error: ${err.message}`, BannerType.ERROR);
		}
	};

	const loadWorkspace = async (workspaceName: string) => {
		await runWithLoading(async () => {
			const res = await fetch(`${API_BASE_URL}/project/${loadedProjectName}/workspace/${workspaceName}/load`);
			if (!res.ok) throw new Error("Failed to load workspace");

			console.log(res.json());
			showNotification(`Workspace "${workspaceName}" loaded successfully.`, BannerType.SUCCESS);
		}).catch((err: any) => {
			showNotification(`Load error: ${err.message}`, BannerType.ERROR);
		});
	};

	useEffect(() => {
		refreshProjects();
		if (loadedProjectName) {
			refreshWorkspaces(loadedProjectName);
		}
	}, []);

	return (
		<div className="relative h-full flex flex-col text-white px-4 pt-4">
			<h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">Projects</h1>

			<div className="flex-1 overflow-y-auto divide-y divide-gray-700">
				{projects.map((project) => (
					<div key={project.name} className="relative mb-2">
						<div
							className={`py-3 flex items-center justify-between ${
								loadedProjectName === project.name
									? "text-[#7140F4] font-semibold"
									: "text-white hover:text-[#7140F4]"
							}`}
						>
							<button
								disabled={loading}
								onClick={() => handleProjectClick(project.name)}
								className="flex items-center text-left w-full hover:cursor-pointer transition-colors duration-300 ease-in-out"
							>
								<img
									src={
										loadedProjectName === project.name
											? "/icons/leftSideBar/current_project_icon.png"
											: "/icons/leftSideBar/project_icon.png"
									}
									className="w-5 h-5 mr-2"
									alt="Project"
								/>
								<span className="truncate">{project.name}</span>
							</button>

							<ProjectActionsMenu
								disabled={loading}
								onDelete={() => askDeleteProject(project.name)}
								onEdit={() => setEditTarget(project.name)}
							/>
						</div>

						{loadedProjectName === project.name && workspaces.length > 0 && !loading && (
							<div className="ml-7 space-y-2 mb-3">
								{workspaces.map((workspace) => (
									<div
										key={workspace}
										className="flex items-center text-base text-gray-300 hover:text-indigo-400 cursor-pointer transition-colors duration-200"
										onClick={() => loadWorkspace(workspace)}
									>
										<div className="w-2 h-2 bg-gray-500 rounded-full mr-3 mt-1" />
										<span className="truncate">{workspace}</span>
									</div>
								))}
							</div>
						)}
					</div>
				))}

				<div className="py-3">
					<button
						disabled={loading}
						onClick={() => setCreateModalOpen(true)}
						className="flex items-center w-full hover:text-[#7140F4] hover:cursor-pointer transition-colors duration-300 ease-in-out"
					>
						<img
							src="/icons/leftSideBar/plus_icon.png"
							className="w-5 h-5 mr-2"
							alt="Add"
						/>
						<span>Upload project</span>
					</button>
				</div>
			</div>

			<ProjectUploadModal
				open={createModalOpen}
				defaultName={loadedProjectName ?? ''}
				pendingFiles={pendingFiles}
				onFilesChange={setPendingFiles}
				onCancel={cancelCreateModal}
				onSuccess={async (name) => {
					cancelCreateModal();
					await refreshProjects();
					await loadProject(name, true);
				}}
			/>

			<ProjectEditModal
				projectName={editTarget}
				onClose={() => setEditTarget(null)}
			/>

			<ConfirmModal
				open={deleteTarget !== null}
				title="Delete project?"
				message={`Project “${deleteTarget ?? ''}” will be permanently removed.`}
				confirmLabel="Delete"
				cancelLabel="Cancel"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={async () => {
					if (deleteTarget) await runWithLoading(() => runDeleteProject(deleteTarget));
					setDeleteTarget(null);
				}}
			/>
		</div>
	);
}
