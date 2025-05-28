import React from 'react';

interface LoadingOverlayProps {
	color?: string;
}

export default function LoadingOverlay({ color = '#7140F4' }: LoadingOverlayProps) {
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100">
			<svg
				className="animate-spin w-10 h-10"
				viewBox="0 0 24 24"
				fill="none"
				style={{ color }}
			>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				/>
				<path
					className="opacity-75"
					d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
					fill="currentColor"
				/>
			</svg>
		</div>
	);
}
