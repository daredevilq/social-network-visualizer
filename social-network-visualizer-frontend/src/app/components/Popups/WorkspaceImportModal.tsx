'use client';

import { useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FileDocumentIcon } from '@/app/components/icons/Icons';

interface Props {
  open: boolean;
  onCancel: () => void;
  onImport: (file: File) => Promise<void>;
}

export default function WorkspaceImportModal({ open, onCancel, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.endsWith('.json')) {
      setError('Only JSON files are allowed');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setImporting(true);
    try {
      await onImport(selectedFile);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import workspace');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />

      <div className="bg-[#262631] rounded-xl p-6 w-full max-w-md z-50 relative shadow-xl text-white" onClick={(e) => e.stopPropagation()}>
        <Dialog.Title className="text-2xl font-bold mb-4 text-center">Import Workspace</Dialog.Title>

        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-3">
            Select a JSON file to import as a workspace. The file will be validated against the current project's database.
          </p>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" disabled={importing} />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#7140F4]">
                  <FileDocumentIcon />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={importing}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="px-4 py-2 rounded-md bg-[#7140F4] hover:bg-[#5b30c9] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose JSON File
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>

        <div className="rounded p-3 mb-4 text-xs text-gray-300">
          <p className="font-semibold mb-1">Import validation:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Nodes must exist in the current project's database</li>
            <li>Edges must reference valid nodes and relationships</li>
            <li>Invalid items will be skipped with a report</li>
          </ul>
        </div>

        <div className="flex justify-end gap-4">
          <button
            disabled={importing}
            onClick={handleClose}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            disabled={!selectedFile || importing}
            onClick={handleImport}
            className="px-4 py-2 rounded-md bg-[#7140F4] hover:bg-[#5b30c9] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : 'Import Workspace'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
