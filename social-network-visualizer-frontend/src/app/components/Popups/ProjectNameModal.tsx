'use client';
import { useEffect, useState } from 'react';

interface Props {
	open: boolean;
	defaultName: string | null;
	onCancel: () => void;
	onConfirm: (name: string) => void;
}

export default function ProjectNameModal({
	open,
	defaultName,
	onCancel,
	onConfirm,
}: Props) {
	const [name, setName] = useState(defaultName ?? '');

	useEffect(() => setName(defaultName ?? ''), [defaultName]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
			<div className="bg-[#262631] rounded-xl shadow-xl w-[90%] max-w-md p-6 space-y-6">
				<h2 className="text-xl font-bold text-white">Choose project name</h2>

				<input
					autoFocus
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder="project name"
					className="w-full px-4 py-2 rounded-md bg-[#1E1E25] text-white focus:outline-none"
				/>

				<div className="flex justify-end gap-4">
					<button
						onClick={onCancel}
						className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white"
					>
						Cancel
					</button>
					<button
						disabled={name.trim() === ''}
						onClick={() => onConfirm(name.trim())}
						className="px-4 py-2 rounded-md bg-[#7140F4] hover:bg-[#5d34c7] text-white disabled:opacity-40"
					>
						OK
					</button>
				</div>
			</div>
		</div>
	);
}
