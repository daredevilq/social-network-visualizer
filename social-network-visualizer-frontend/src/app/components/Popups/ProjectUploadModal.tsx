'use client';

import { useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';

interface ProjectUploadModalProps {
	API: string;
	open: boolean;
	defaultName?: string;
	pendingFiles: File[];
	onCancel: () => void;
	onFilesChange: (files: File[]) => void;
	onSuccess: (name: string) => void;
}

export default function ProjectUploadModal({
	API,
	open,
	defaultName = '',
	pendingFiles,
	onCancel,
	onFilesChange,
	onSuccess,
}: ProjectUploadModalProps) {
	const nameRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isNameError, setIsNameError] = useState<boolean>(false);
	const [isFileError, setIsFileError] = useState<boolean>(false);

	const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);
			onFilesChange([...pendingFiles, ...filesArray]);
			e.target.value = '';
			setIsFileError(false);
		}
	};

	const handleUpload = async () => {
		if (!nameRef.current) return;
	
		const projectName = nameRef.current.value.trim();
		let hasError = false;

		if (!projectName) {
			setErrorMessage('Please enter a project name.');
			setIsNameError(true);
			hasError = true;
		}

		if (pendingFiles.length === 0) {
			setErrorMessage('Please add at least one file.');
			setIsFileError(true);
			hasError = true;
		}

		if (hasError) return;

		const formData = new FormData();
		pendingFiles.forEach((file) => {
			formData.append('files', file);
		});

		try {
			const response = await fetch(`${API}/project/${projectName}`, {
				method: 'POST',
				body: formData,
			});

			const text = await response.text();
			if (!response.ok) {
				let message = 'Upload failed.';

				try {
					const json = JSON.parse(text);
					if (json.error) {
						message = json.error;
					}
				} catch {
					// Handle non-JSON error messages
				}

				if (message.includes('already exists')) {
					setErrorMessage(`Project with name '${projectName}' already exists.`);
					setIsNameError(true);
				} else {
					setErrorMessage(message);
				}

				throw new Error(message);
			}

			onSuccess(projectName);
			if (nameRef.current) nameRef.current.value = '';
			onFilesChange([]);
		} catch (error: any) {
			console.error('Upload error:', error);
			alert(error.message);
		}
	};

	const removeFile = (index: number) => {
		const updatedFiles = [...pendingFiles];
		updatedFiles.splice(index, 1);
		onFilesChange(updatedFiles);
	};

	return (
		<Dialog open={open} onClose={onCancel} className="fixed inset-0 z-50 flex items-center justify-center">
			open && (
				<div
					className="fixed inset-0 bg-black/50"
					aria-hidden="true"
					onClick={onCancel}
				/>
			)

			<div
				className="bg-[#262631] rounded-xl p-6 w-full max-w-md z-50 relative shadow-xl text-white"
				onClick={(e) => e.stopPropagation()}
			>
				<Dialog.Title className="text-2xl font-bold text-center mb-4">
					Upload New Project
				</Dialog.Title>

				<input
					ref={nameRef}
					defaultValue={defaultName}
					placeholder="Project name"
					className={`w-full mb-4 p-2 rounded placeholder:text-gray-400 bg-transparent border ${
						isNameError ? 'border-red-500' : 'border-gray-600'
					}`}
				/>

				{isNameError && (
					<p className="text-red-400 text-sm mb-4">{errorMessage}</p>
				)}

				<div
					className={`mb-4 p-2 rounded ${
						isFileError ? 'border-2 border-red-300' : 'border-2 border-gray-600'
					}`}
				>
					<p className="font-semibold mb-1">Selected files:</p>
					<ul className="max-h-32 overflow-y-auto text-sm list-disc list-inside bg-[#30303d] p-2 rounded">
						{pendingFiles.length === 0 ? (
							<li className="italic text-gray-400">No files added yet. Please select files.</li>
						) : (
							pendingFiles.map((file, idx) => (
								<li key={idx} className="flex justify-between items-center">
									<span>{file.name}</span>
									<button
										onClick={() => removeFile(idx)}
										className="text-red-400 hover:text-red-500 ml-2"
									>
										✖
									</button>
								</li>
							))
						)}
					</ul>
				</div>

				<div className="flex justify-between items-center mb-4">
					<button
						onClick={() => fileInputRef.current?.click()}
						className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
					>
						Add files
					</button>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept=".json"
						onChange={handleFilesSelected}
						className="hidden"
					/>
				</div>

				<div className="flex justify-end space-x-2">
					<button
						onClick={() => {
							setIsFileError(false);
							setIsNameError(false);
							onCancel();
						}}
						className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white"
					>
						Cancel
					</button>
					<button
						onClick={handleUpload}
						className="px-4 py-2 rounded bg-[#7140F4] hover:bg-[#5b30c9]"
					>
						Upload
					</button>
				</div>
			</div>
		</Dialog>
	);
}
