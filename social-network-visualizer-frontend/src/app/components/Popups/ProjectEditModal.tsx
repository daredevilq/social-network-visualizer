'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';

interface Props {
	API: string;
	projectName: string | null;
	onClose: () => void;
	onSuccess: () => void;
}

export default function ProjectEditModal({ API, projectName, onClose, onSuccess }: Props) {
	const open = projectName !== null;
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [filesOnServer, setFilesOnServer] = useState<string[]>([]);
	const [pendingFiles, setPendingFiles]   = useState<File[]>([]);
	const [loading, setLoading]             = useState(false);
	const [status, setStatus]               = useState<string | null>(null);
	const showStatus = (msg: string) => { setStatus(msg); setTimeout(() => setStatus(null), 3_000); };

	const loadFileList = async () => {
		if (!projectName) return;
		const res = await fetch(`${API}/project/${encodeURIComponent(projectName)}/file`);
		setFilesOnServer(await res.json());
	};

	const handleClose = () => {
		onClose();
		onSuccess();
	};

	const addFiles = async () => {
		if (!projectName || pendingFiles.length === 0) return;
		setLoading(true);
		const fd = new FormData();
		pendingFiles.forEach(f => fd.append('files', f));
		
		const res = await fetch(`${API}/project/${encodeURIComponent(projectName)}/files/add`, {
			method: 'PUT',
			body:   fd,
		});
		setLoading(false);

		if (res.ok) {
			showStatus('Files added');
			setPendingFiles([]);
			await loadFileList();
		} else {
			showStatus(`Error: ${res.statusText}`);
		}
	};

	const deleteFile = async (fileName: string) => {
		if (!projectName) return;
		setLoading(true);
		const res = await fetch(
		`${API}/project/${encodeURIComponent(projectName)}/file/${encodeURIComponent(fileName)}`,
		{ method: 'DELETE' });
		setLoading(false);
		if (res.ok) {
		showStatus(`File “${fileName}” deleted`);
		await loadFileList();
		} else {
		showStatus(`Error: ${res.statusText}`);
		}
	};


  	// lista plikow po otwarciu 
	useEffect(() => { if (open) loadFileList().catch(console.error); }, [projectName]);


	return (
		<Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
		{open && (
			<div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={handleClose} />
		)}

		<div
			className="bg-[#262631] rounded-xl p-6 w-full max-w-lg z-50 relative shadow-xl text-white"
			onClick={e => e.stopPropagation()}
		>
			{/* naglowek */}
			<Dialog.Title className="text-2xl font-bold mb-4 text-center">
			Edit “{projectName}”
			</Dialog.Title>

			{/* lista plikow */}
			<h3 className="font-semibold mb-2">Existing files</h3>
			<ul className="max-h-48 overflow-y-auto text-sm list-disc list-inside bg-[#30303d] p-2 rounded mb-4">
			{filesOnServer.length === 0
				? <li className="italic text-gray-400">No files in project</li>
				: filesOnServer.map(fn => (
					<li key={fn} className="flex justify-between items-center">
					<span>{fn}</span>
					<button
						disabled={loading}
						onClick={() => deleteFile(fn)}
						className="text-red-400 hover:text-red-500 ml-2"
					>
						✖
					</button>
					</li>
				))}
			</ul>

			{/* dodawanie nowychh plikow */}
			<h3 className="font-semibold mb-2">Add new files</h3>
			<div className="border-2 border-gray-600 rounded p-2 mb-4">
			<ul className="max-h-24 overflow-y-auto text-sm list-disc list-inside">
				{pendingFiles.length === 0
				? <li className="italic text-gray-400">No files selected</li>
				: pendingFiles.map(f => <li key={f.name}>{f.name}</li>)}
			</ul>

			<div className="flex justify-between mt-2">
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
				onChange={e => {
					if (e.target.files) {
					setPendingFiles([...pendingFiles, ...Array.from(e.target.files)]);
					e.target.value = '';
					}
				}}
				className="hidden"
				/>

				<button
				disabled={loading || pendingFiles.length === 0}
				onClick={addFiles}
				className="px-3 py-1 rounded bg-[#7140F4] hover:bg-[#5b30c9] text-sm"
				>
				Upload
				</button>
			</div>
			</div>

			<div className="flex justify-end gap-4">
			<button
				disabled={loading}
				onClick={handleClose}
				className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500"
			>
				Close
			</button>
			</div>

			{status && <p className="text-center text-sm text-[#7140F4] mt-4">{status}</p>}
		</div>
		</Dialog>
	);
	}
