'use client';
import { useState, useRef, useEffect } from 'react';

interface Props {
	disabled: boolean;
	onDelete: () => void;
	onEdit: () => void;
}

export default function ProjectActionsMenu({ disabled, onDelete, onEdit }: Props) {
	const [open, setOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null!);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) =>
			!buttonRef.current?.contains(e.target as Node) && setOpen(false);
		window.addEventListener('click', handler);
		return () => window.removeEventListener('click', handler);
	}, [open]);

	return (
		<div className="relative">
			{/* 3dots icon */}
			<button
				ref={buttonRef}
				disabled={disabled}
				onClick={() => setOpen((v) => !v)}
				className="p-1 rounded hover:bg-white/10 disabled:opacity-40"
			>
				<svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
					<circle cx="10" cy="4"  r="2" />
					<circle cx="10" cy="10" r="2" />
					<circle cx="10" cy="16" r="2" />
				</svg>
			</button>

			{/* menu */}
			{open && (
			<div className="absolute right-0 mt-1 w-32 bg-[#262631] rounded shadow-lg z-10">
				<button
				onClick={() => { setOpen(false); onEdit(); }}
				className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
				>
				Edit project
				</button>
				<button
				onClick={() => { setOpen(false); onDelete(); }}
				className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
				>
				Delete project
				</button>
			</div>
			)}
		</div>
	);
}
