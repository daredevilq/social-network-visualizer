'use client';

import { useEffect, useRef, useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import { ProjectSummary } from '@/app/interface/ProjectSummary';

import ProjectNameModal   from '@/app/components/Popups/ProjectNameModal';
import ProjectActionsMenu from '@/app/components/Popups/ProjectActionsMenu';
import ConfirmModal       from '@/app/components/Popups/ConfirmModal';
import ProjectUploadModal from '@/app/components/Popups/ProjectUploadModal';
import ProjectEditModal from '@/app/components/Popups/ProjectEditModal';

const API = 'http://localhost:8080';

export default function ProjectsContent() {
	const { selected, loading, select, runWithLoading, refresh } = useProject();
	const [projects, setProjects] = useState<ProjectSummary[]>([]);
	const [status, setStatus] = useState<string | null>(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
	const [editTarget, setEditTarget] = useState<string|null>(null);
	const hideTimer = useRef<NodeJS.Timeout | null>(null);

	const askDeleteProject = (name: string) => setDeleteTarget(name);
	const cancelCreateModal = () => { setCreateModalOpen(false); setPendingFiles([]); };

	const showStatus = (msg: string) => {
		clearTimeout(hideTimer.current as NodeJS.Timeout);
		setStatus(msg);
		hideTimer.current = setTimeout(() => setStatus(null), 3_000);
	};

	const refreshProjects = async () => {
		const res = await fetch(`${API}/project/list`);
		setProjects(await res.json());
	};


	const runDeleteProject = async (name: string) => {
		await runWithLoading(async () => {
			const res = await fetch(`${API}/project/${encodeURIComponent(name)}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

			if (selected === name) await select('');
			await refreshProjects();
			showStatus(`Project “${name}” deleted`);
		}).catch(err => {
			console.error(err);
			showStatus(`Delete error: ${err.message}`);
		});
	};

	useEffect(() => { refreshProjects().catch(console.error); }, []);
	useEffect(() => {
		if (selected) showStatus(`Project “${selected}” loaded`);
	}, [selected]);

	return (
		<div className="relative h-full flex flex-col text-white px-4 pt-4">
			<h1 className="text-2xl font-bold border-b border-white pb-2 mb-4">Projects</h1>

			<div className="flex-1 overflow-y-auto divide-y divide-gray-700">
				{projects.map(p => (
					<div
						key={p.name}
						className={`py-3 flex items-center justify-between
                        ${selected === p.name ? 'text-[#7140F4] font-semibold' : 'text-white hover:text-[#7140F4]'}`}
					>
						<button
							disabled={loading}
							onClick={() => select(p.name)}
							className="flex items-center text-left w-full hover:cursor-pointer transition-colors duration-300 ease-in-out"
						>
							<img
								src={
									selected === p.name
										? '/icons/leftSideBar/current_project_icon.png'
										: '/icons/leftSideBar/project_icon.png'
								}
								className="w-5 h-5 mr-2"
								alt="Project"
							/>
							<span className="truncate">{p.name}</span>
						</button>

						<ProjectActionsMenu
							disabled={loading}
							onDelete={() => askDeleteProject(p.name)}
							onEdit={() => setEditTarget(p.name)}
						/>
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

			{status && !loading && (
				<p className="text-center text-sm text-[#7140F4] py-2">{status}</p>
			)}

			{/* Modals here */}
			<ProjectUploadModal
				API={API}
				open={createModalOpen}
				defaultName={selected ?? ''}
				pendingFiles={pendingFiles}
				onFilesChange={setPendingFiles}
				onCancel={cancelCreateModal}
				onSuccess={async (name) => {
					cancelCreateModal();
					await refreshProjects();
					await select(name);
					showStatus('Project uploaded successfully');
				}}
			/>

			<ProjectEditModal
				API={API}
				projectName={editTarget}
				onClose={() => setEditTarget(null)}
				onSuccess={async () => {
					await refresh();
					await refreshProjects();
				}}
			/>

			<ConfirmModal
				open={deleteTarget !== null}
				title="Delete project?"
				message={`Project “${deleteTarget ?? ''}” will be permanently removed.`}
				confirmLabel="Delete"
				cancelLabel="Cancel"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => {
					if (deleteTarget) runDeleteProject(deleteTarget);
					setDeleteTarget(null);
				}}
			/>
		</div>
	);
}
