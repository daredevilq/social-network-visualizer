'use client';

import { useEffect, useRef, useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import { ProjectSummary } from '@/app/interface/ProjectSummary';

import ProjectNameModal   from '@/app/components/Popups/ProjectNameModal';
import ProjectActionsMenu from '@/app/components/Popups/ProjectActionsMenu';
import ConfirmModal       from '@/app/components/Popups/ConfirmModal';

const API = 'http://localhost:8080';

export default function ProjectsContent() {
	const { selected, loading, select, runWithLoading } = useProject();
	const [projects, setProjects] = useState<ProjectSummary[]>([]);
	const [status,   setStatus]   = useState<string | null>(null);
	const [nameModalOpen, setNameModalOpen] = useState(false);
	const [pendingFiles,  setPendingFiles]  = useState<File[]>([]);
	const [deleteTarget,  setDeleteTarget]  = useState<string | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);
	const hideTimer = useRef<NodeJS.Timeout | null>(null);
	const askDeleteProject = (name: string) => setDeleteTarget(name);
	const cancelNameModal = () => { setNameModalOpen(false); setPendingFiles([]); };
	
	const showStatus = (msg: string) => {
		clearTimeout(hideTimer.current as NodeJS.Timeout);
		setStatus(msg);
		hideTimer.current = setTimeout(() => setStatus(null), 3_000); // po 3 sek znika
	};

	const refreshProjects = async () => {
		const res = await fetch(`${API}/project/list`);
		setProjects(await res.json());
	};

	const handleChooseFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;
		setPendingFiles(Array.from(e.target.files));
		setNameModalOpen(true);
		e.target.value = '';
	};

	const confirmName = async (name: string) => {
		setNameModalOpen(false);
		if (!pendingFiles.length) return;

		await runWithLoading(async () => {
			const form = new FormData();
			pendingFiles.forEach(f => form.append('files', f, f.name));

			const exists = projects.some(p => p.name === name);
			const url    = exists
				? `${API}/project/${encodeURIComponent(name)}/files/add`
				: `${API}/project/${encodeURIComponent(name)}`;
			const method = exists ? 'PUT' : 'POST';

			const res = await fetch(url, { method, body: form });
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
			showStatus(exists ? 'Files added' : 'Project created');

			await refreshProjects();
			await select(name);
			setPendingFiles([]);
		}).catch(err => {
			console.error(err);
			showStatus(`Upload error: ${err.message}`);
		});
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
		<div className="relative h-full flex flex-col text-white">
			<h1 className="text-2xl font-bold border-b border-white py-2">Projects</h1>

			<div className="flex-1 overflow-y-auto">
				{projects.map(p => (
					<div
						key={p.name}
						className={`flex items-center justify-between w-full py-3 border-b border-gray-500
												${selected === p.name ? 'text-[#7140F4]' : 'hover:text-[#7140F4]'}`}
					>
						<button
							disabled={loading}
							onClick={() => select(p.name)}
							className="flex items-center flex-1 text-left"
						>
							<img
								src={
									selected === p.name
										? '/icons/leftSideBar/current_project_icon.png'
										: '/icons/leftSideBar/project_icon.png'
								}
								className="w-7 h-7 mr-2"
								alt=""
							/>
							<span className="truncate">{p.name}</span>
						</button>

						<ProjectActionsMenu
							disabled={loading}
							onDelete={() => askDeleteProject(p.name)}
						/>
					</div>
				))}

				{/* upload */}
				<button
					disabled={loading}
					onClick={() => fileRef.current?.click()}
					className="flex items-center w-full py-3 hover:text-[#7140F4]"
				>
					<img src="/icons/leftSideBar/plus_icon.png" className="w-7 h-7 mr-2" alt="" />
					<span>Upload project</span>
					<input
						ref={fileRef}
						type="file"
						multiple
						accept=".json"
						onChange={handleChooseFiles}
						className="hidden"
					/>
				</button>
			</div>

			{status && !loading && (
				<p className="text-center text-sm text-[#7140F4] py-2">{status}</p>
			)}

			{/* nowy projekt */}
			<ProjectNameModal
				open={nameModalOpen}
				defaultName={selected}
				onCancel={cancelNameModal}
				onConfirm={confirmName}
			/>

			{/* potwierdzienie */}
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
