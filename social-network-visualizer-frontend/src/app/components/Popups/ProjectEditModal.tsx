'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import {useProject} from "@/app/context/ProjectContext";

interface Props {
	API: string;
	projectName: string | null;
	onClose: () => void;
}

export default function ProjectEditModal({
	API,
	projectName,
	onClose
}: Props) {
	const open = projectName !== null;
	const fileInputRef = useRef<HTMLInputElement>(null!);
	const [filesOnServer, setFilesOnServer] = useState<string[]>([]);
	const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
	const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState<string | null>(null);
	const { loadedProjectName, graphRelationType, fetchGraphData, runWithLoading } = useProject();

	const showStatus = (msg: string) => {
		setStatus(msg);
		setTimeout(() => setStatus(null), 3_000);
	};

	const loadFileList = async () => {
		if (!projectName) return;
		const res = await fetch(
			`${API}/project/${encodeURIComponent(projectName)}/file`
		);
		setFilesOnServer(await res.json());
	};

	const handleSave = async () => {
		setLoading(true);

		await runWithLoading(() => deleteFiles());
		if (projectName && projectName === loadedProjectName) {
			await runWithLoading(() => uploadToOpenedProject());
			await fetchGraphData();
			window.location.href = "/";

		} else {
			await uploadFiles();
		}

		setLoading(false);
		onClose();
	};

	const uploadToOpenedProject = async () => {
		if (!projectName || filesToUpload.length === 0) return;

		try {
			const fd = new FormData();
			filesToUpload.forEach((f) => fd.append('files', f));
			fd.append('graph-type', graphRelationType);

			const res = await fetch(
				`${API}/project/${encodeURIComponent(projectName)}/file`,
				{ method: 'PUT', body: fd }
			);
			if (!res.ok) throw new Error('Failed to upload to current project');

			const data = await res.json();
			showStatus(data.message);

			setFilesToUpload([]);
		} catch (err: any) {
			showStatus(err.message || 'Failed to upload files');
		}
	};

	const uploadFiles = async () => {
		if (!projectName || filesToUpload.length === 0) return;

		try {
			const fd = new FormData();
			filesToUpload.forEach((f) => fd.append('files', f));

			const res = await fetch(
				`${API}/project/${encodeURIComponent(projectName)}`,
				{ method: 'PUT', body: fd }
			);

			if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
			const data = await res.json();
			showStatus(data.message);

			setFilesToUpload([]);
		} catch (err: any) {
			showStatus(err.message || 'Failed to upload files');
		}
	};

	const deleteFiles = async () => {
		if (!projectName || filesToDelete.length === 0) return;

		try {
			for (const fileName of filesToDelete) {
				const res = await fetch(
					`${API}/project/${encodeURIComponent(projectName)}/file/${encodeURIComponent(fileName)}`,
					{ method: 'DELETE' }
				);
				if (!res.ok) throw new Error(`Failed to delete ${fileName}`);
			}
			showStatus('Marked files deleted');
			setFilesToDelete([]);
		} catch (err: any) {
			showStatus(err.message || 'Failed to delete files');
		}
	};


	const handleCancel = () => {
		setFilesToDelete([]);
		setFilesToUpload([]);

		onClose();
	};

	const handleMarkFileForDeletion = (fileName: string) => {
		setFilesToDelete((prev) => (prev.includes(fileName) ? prev : [...prev, fileName]));
		setFilesOnServer((prev) => prev.filter((name) => name !== fileName));
	};

	useEffect(() => {
		if (open) loadFileList().catch(console.error);
	}, [projectName]);


	return (
		<Dialog
			open={open}
			onClose={handleCancel}
			className="fixed inset-0 z-50 flex items-center justify-center"
		>
			<div className="fixed inset-0 bg-black/50" />

			<div
				className="bg-[#262631] rounded-xl p-6 w-full max-w-lg z-50 relative shadow-xl text-white"
				onClick={(e) => e.stopPropagation()}
			>
				<Dialog.Title className="text-2xl font-bold mb-4 text-center">
					Edit {projectName}
				</Dialog.Title>

				<h3 className="font-semibold mb-2">Existing files</h3>
				<ul className="max-h-48 flex flex-col bg-[#262631] overflow-y-auto scrollbar-dark p-2 rounded mb-4 pr-2">
					{filesOnServer.length === 0 ? (
						<li className="italic text-gray-400">No files in project</li>
					) : (
						filesOnServer.map((fn) => (
							<li key={fn} className="flex justify-between items-center">
								<span>{fn}</span>
								<button
									disabled={loading}
									onClick={() => handleMarkFileForDeletion(fn)}
									className="text-red-400 hover:text-red-500 ml-2"
								>
									✖
								</button>
							</li>
						))
					)}
				</ul>

				<h3 className="font-semibold mb-2">Add new files</h3>
				<div className="border-2 border-gray-600 rounded p-2 mb-4">
					<ul className="max-h-24 overflow-y-auto text-sm list-disc list-inside">
						{filesToUpload.length === 0 ? (
							<li className="italic text-gray-400">No files selected</li>
						) : (
							filesToUpload.map((f) => <li key={f.name}>{f.name}</li>)
						)}
					</ul>

					<div className="w-full flex justify-end mt-2">
						<button
							onClick={() => fileInputRef.current?.click()}
							className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-black text-sm"
						>
							Choose files
						</button>
						<input
							ref={fileInputRef}
							type="file"
							multiple
							accept=".json"
							onChange={(e) => {
								if (e.target.files) {
									setFilesToUpload([
										...filesToUpload,
										...Array.from(e.target.files),
									]);
									e.target.value = '';
								}
							}}
							className="hidden"
						/>
					</div>
				</div>

				<div className="flex justify-end gap-4">
					<button
						disabled={loading}
						onClick={handleCancel}
						className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500"
					>
						Cancel
					</button>

					<button
						disabled={loading}
						onClick={() => handleSave()}
						className="px-4 py-2 rounded-md bg-[#7140F4] hover:bg-[#5b30c9]"
					>
						Reload changes
					</button>
				</div>

				{status && (
					<p className="text-center text-sm text-[#7140F4] pt-2">{status}</p>
				)}
			</div>
		</Dialog>
	);
}
