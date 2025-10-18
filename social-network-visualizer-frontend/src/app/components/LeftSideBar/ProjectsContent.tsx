'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import { ProjectSummary } from '@/app/interface/ProjectSummary';
import ProjectActionsMenu from '@/app/components/Popups/ProjectActionsMenu';
import WorkspaceActionMenu from '@/app/components/Popups/WorkspaceActionMenu';
import ConfirmModal from '@/app/components/Popups/ConfirmModal';
import ProjectUploadModal from '@/app/components/Popups/ProjectUploadModal';
import ProjectEditModal from '@/app/components/Popups/ProjectEditModal';
import ProjectConfigViewModal from "@/app/components/Popups/ProjectConfigViewModal";
import {resetProjectName} from "@/app/project-state";
import {API_BASE_URL} from "@/app/configuration/urlConfig";
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";
import WorkspaceCreateModal from "@/app/components/Popups/WorkspaceCreateModal";

type DeleteTarget = {
	type: 'project' | 'workspace';
	name: string;
} | null;

export default function ProjectsContent() {
	const { loadedProjectName, loading, loadProject, runWithLoading, setGraphData } = useProject();
	const { showNotification } = useNotification()
	const [projects, setProjects] = useState<ProjectSummary[]>([]);
	const [workspaces, setWorkspaces] = useState<string[]>([]);
	const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
	const [editTarget, setEditTarget] = useState<string|null>(null);
	const [selectedWorkspace, setSelectedWorkspace] = useState<string|null>(null);
	const askDeleteProject = (name: string) => setDeleteTarget({ type: 'project', name });
	const askDeleteWorkspace = (name: string) => setDeleteTarget({ type: 'workspace', name });
	const cancelCreateModal = () => { setCreateProjectModalOpen(false); setPendingFiles([]); };
    const [viewConfigTarget, setViewConfigTarget] = useState<string | null>(null);

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
				setWorkspaces([]);
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
			setSelectedWorkspace(workspaceName);
			showNotification(`Workspace "${workspaceName}" loaded successfully.`, BannerType.SUCCESS);
		}).catch((err: any) => {
			showNotification(`Load error: ${err.message}`, BannerType.ERROR);
		});
	};

	const deleteWorkspace = async (workspaceName: string) => {
		await runWithLoading(async () => {
			const res = await fetch(`${API_BASE_URL}/project/${loadedProjectName}/workspace/${workspaceName}`, { method: 'DELETE' });
			if (!res.ok) throw new Error("Failed to delete workspace");

			if (workspaceName === loadedProjectName) {
				setWorkspaces([]);
			}
			refreshWorkspaces(loadedProjectName!);
			showNotification(`Workspace “${workspaceName}” deleted`, BannerType.INFO);
		}).catch((err: any) => {
			showNotification(`Delete error: ${err.message}`, BannerType.ERROR);
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
                                onViewConfig={() => setViewConfigTarget(project.name)}
                            />
                        </div>

						{loadedProjectName === project.name && !loading && (
							<div className="ml-7 space-y-2 mb-3">
								{workspaces.map((workspace) => (
									<div
										key={workspace}
										className={`group relative flex items-center justify-between text-base duration-200 pl-3 pr-0 cursor-pointer transition-colors duration-200 
										${selectedWorkspace === workspace ? "text-[#7140F4]" : "text-white hover:text-[#7140F4]"}`}
									>
									<button
										disabled={loading}
										onClick={() => {
											setSelectedWorkspace(workspace);
											loadWorkspace(workspace);
										}}
										className="flex items-center flex-1 text-left transition-colors duration-200"
									>
										<span
											className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded transition-colors duration-200 
											${selectedWorkspace === workspace ? "bg-[#7140F4]" : "bg-white group-hover:bg-[#7140F4]"}`}
										/>
										<span className="truncate pr-6">{workspace}</span>
									</button>

									<WorkspaceActionMenu
										disabled={loading}
										onDelete={() => askDeleteWorkspace(workspace)}
										onEdit={() => console.log()}
										onExport={() => console.log()}
									/>
								</div>
								))}
								<div className="py-1">
									<button
										disabled={loading}
										onClick={() => setCreateWorkspaceModalOpen(true)}
										className="flex items-center w-full hover:text-[#7140F4] hover:cursor-pointer transition-colors duration-300 ease-in-out text-white"
									>
										<img
											src="/icons/leftSideBar/plus_icon.png"
											className="w-4 h-4 mr-2"
											alt="Add"
										/>
										<span>Add workspace</span>
									</button>
								</div>
							</div>
						)}
					</div>
				))}

				<div className="py-3">
					<button
						disabled={loading}
						onClick={() => setCreateProjectModalOpen(true)}
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
				open={createProjectModalOpen}
				defaultName={loadedProjectName ?? ''}
				pendingFiles={pendingFiles}
				onFilesChange={setPendingFiles}
				onCancel={cancelCreateModal}
				onSuccess={async (name) => {
                    cancelCreateModal();
                    await refreshProjects();
					await loadProject(name, true);
                    showNotification(`Project "${name}" uploaded successfully. Click to load.`, BannerType.SUCCESS);
				}}
			/>

			<ProjectEditModal
				projectName={editTarget}
				onClose={() => setEditTarget(null)}
			/>
            <ProjectConfigViewModal
                projectName={viewConfigTarget}
                onClose={() => setViewConfigTarget(null)}
            />
			<WorkspaceCreateModal
				open={createWorkspaceModalOpen}
				projectName={loadedProjectName!}
				onCancel={() => setCreateWorkspaceModalOpen(false)}
				onSuccess={async (workspaceName: string) => {
					setCreateWorkspaceModalOpen(false);
					await refreshWorkspaces(loadedProjectName!);
					setSelectedWorkspace(workspaceName);
					showNotification(`Workspace "${workspaceName}" created.`, BannerType.SUCCESS);
				}}
			/>

			<ConfirmModal
				open={deleteTarget !== null}
				title={deleteTarget?.type === 'project' ? "Delete project?" : "Delete workspace?"}
				message={`${
					deleteTarget?.type === 'project' ? "Project" : "Workspace"
				} “${deleteTarget?.name ?? ''}” will be permanently removed.`}
				confirmLabel="Delete"
				cancelLabel="Cancel"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={async () => {
					if (!deleteTarget) return;

					if (deleteTarget.type === 'project') {
						runDeleteProject(deleteTarget.name);
					} else {
						deleteWorkspace(deleteTarget.name);
					}

					setDeleteTarget(null);
				}}
			/>
		</div>
	);
}
