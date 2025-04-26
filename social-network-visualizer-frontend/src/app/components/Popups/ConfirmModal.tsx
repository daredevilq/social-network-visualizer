'use client';
interface Props {
	open: boolean;
	title: string;
	message?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onCancel: () => void;
	onConfirm: () => void;
}
export default function ConfirmModal({
	open,
	title,
	message,
	confirmLabel = 'OK',
	cancelLabel = 'Cancel',
	onCancel,
	onConfirm,
}: Props) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
			<div className="bg-[#262631] rounded-xl shadow-xl w-[90%] max-w-sm p-6 space-y-6">
				<h2 className="text-xl font-bold text-white">{title}</h2>
				{message && <p className="text-white/80">{message}</p>}

				<div className="flex justify-end gap-4">
					<button
						onClick={onCancel}
						className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white"
					>
						{cancelLabel}
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white"
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
