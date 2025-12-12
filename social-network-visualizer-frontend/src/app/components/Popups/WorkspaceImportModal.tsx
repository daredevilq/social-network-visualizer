'use client';

import { useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { UploadCloud, FileJson, Trash2, Import, AlertTriangle } from 'lucide-react';

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
  const [isDragging, setIsDragging] = useState(false);

  const resetState = () => {
    setSelectedFile(null);
    setError(null);
    setImporting(false);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Invalid format. Only .json files are allowed.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!importing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (importing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
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
    resetState();
    onCancel();
  };

  return (
    <Dialog open={open} onClose={!importing ? handleClose : () => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-[#262631] p-6 text-left align-middle shadow-2xl transition-all border border-gray-700">
          <Dialog.Title className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Import className="w-6 h-6 text-[#7140F4]" />
            Import Workspace
          </Dialog.Title>

          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            Select a JSON file to restore a workspace layout. The file will be strictly validated against the current project's data.
          </p>

          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all min-h-[140px] flex flex-col items-center justify-center
              ${
                isDragging
                  ? 'border-[#7140F4] bg-[#7140F4]/10'
                  : error
                    ? 'border-red-500 bg-red-500/5'
                    : 'border-gray-600 bg-[#30303d] hover:border-gray-500'
              }
              ${importing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && !importing && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" disabled={importing} />

            {selectedFile ? (
              <div className="w-full bg-[#262631] border border-gray-600 rounded p-3 flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-[#7140F4]/10 rounded">
                    <FileJson className="w-6 h-6 text-[#7140F4]" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-sm font-medium text-white truncate max-w-[180px]">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                  }}
                  disabled={importing}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Remove file"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center pointer-events-none">
                <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-[#7140F4]' : 'text-gray-400'}`} />
                <p className="text-sm font-medium text-gray-300">{isDragging ? 'Drop JSON file here' : 'Click to upload or drag & drop'}</p>
                <p className="text-xs text-gray-500 mt-1">JSON files only</p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 mt-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> {error}
            </p>
          )}

          <div className="mt-5 rounded-lg bg-[#30303d] border border-gray-700/50 p-3">
            <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#7140F4]" />
              Validation Rules
            </h4>
            <ul className="space-y-1.5">
              <li className="text-xs text-gray-400 pl-2 border-l-2 border-gray-600">Nodes must exist in current project DB</li>
              <li className="text-xs text-gray-400 pl-2 border-l-2 border-gray-600">Edges must reference valid relationships</li>
              <li className="text-xs text-gray-400 pl-2 border-l-2 border-gray-600">Invalid items will be skipped with a report</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t border-gray-700 pt-4">
            <button
              disabled={importing}
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={!selectedFile || importing}
              onClick={handleImport}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#7140F4] hover:bg-[#5b30c9] text-white shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer flex items-center gap-2"
            >
              {importing && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {importing ? 'Importing...' : 'Import Workspace'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
