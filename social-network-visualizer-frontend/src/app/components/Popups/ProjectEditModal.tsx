'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useProject } from '@/app/context/ProjectContext';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { X, UploadCloud, FileJson, Trash2, Undo2, Save, AlertCircle, FileText } from 'lucide-react';
import { BannerType } from '@/app/components/Popups/Banner';
import { useNotification } from '@/app/context/NotificationProvider';

interface Props {
  projectName: string | null;
  onClose: () => void;
}

export default function ProjectEditModal({ projectName, onClose }: Props) {
  const open = projectName !== null;
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const [filesOnServer, setFilesOnServer] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]); // Lista plików oznaczonych do usunięcia

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { loadedProjectName, loadProject, runWithLoading, fetchGraphData } = useProject();
  const { setIsInWorkspaceMode, setOpenedWorkspaceName } = useWorkspace();
  const { showNotification } = useNotification();

  const scrollbarClass = `
    [scrollbar-width:thin] [scrollbar-color:#7140F4_transparent]
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#7140F4] [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-[#5a33c4]
  `;

  const loadFileList = async () => {
    if (!projectName) return;
    try {
      const res = await fetch(`${API_BASE_URL}/project/${encodeURIComponent(projectName)}/file`);
      if (!res.ok) throw new Error('Failed to fetch file list');
      setFilesOnServer(await res.json());
    } catch (error) {
      console.error(error);
      showNotification('Could not load file list', BannerType.ERROR);
    }
  };

  useEffect(() => {
    if (open) {
      loadFileList().catch(console.error);
      setFilesToDelete([]);
      setFilesToUpload([]);
    }
  }, [projectName, open]);

  const handleMarkForDeletion = (fileName: string) => {
    setFilesToDelete((prev) => [...prev, fileName]);
  };

  const handleUndoDeletion = (fileName: string) => {
    setFilesToDelete((prev) => prev.filter((f) => f !== fileName));
  };

  const handleRemoveUpload = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter((f) => f.name.toLowerCase().endsWith('.json'));
      setFilesToUpload((prev) => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith('.json'));
      if (newFiles.length > 0) {
        setFilesToUpload((prev) => [...prev, ...newFiles]);
      } else {
        showNotification('Only .json files are supported', BannerType.WARNING);
      }
    }
  };

  const deleteFiles = async () => {
    if (!projectName || filesToDelete.length === 0) return;
    for (const fileName of filesToDelete) {
      const res = await fetch(`${API_BASE_URL}/project/${encodeURIComponent(projectName)}/file/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete ${fileName}`);
    }
  };

  const uploadFiles = async (isCurrentProject: boolean) => {
    if (!projectName || filesToUpload.length === 0) return;

    const fd = new FormData();
    filesToUpload.forEach((f) => fd.append('files', f));

    const url = isCurrentProject
      ? `${API_BASE_URL}/project/${encodeURIComponent(projectName)}/file`
      : `${API_BASE_URL}/project/${encodeURIComponent(projectName)}`;

    const res = await fetch(url, {
      method: 'PUT',
      body: fd,
    });

    if (!res.ok) throw new Error('Failed to upload files');
  };

  const handleSave = async () => {
    if (!projectName) return;

    if (filesToDelete.length === 0 && filesToUpload.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    const isCurrentProject = projectName === loadedProjectName;

    try {
      if (filesToDelete.length > 0) {
        await runWithLoading(() => deleteFiles());
      }

      if (filesToUpload.length > 0) {
        if (isCurrentProject) {
          await runWithLoading(() => uploadFiles(true));
        } else {
          await uploadFiles(false);
        }
      }

      if (isCurrentProject) {
        await loadProject(projectName, true);
        await fetchGraphData();
        setIsInWorkspaceMode(false);
        setOpenedWorkspaceName(null);
      }

      showNotification('Project updated successfully', BannerType.SUCCESS);
      onClose();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update project', BannerType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = filesToDelete.length > 0 || filesToUpload.length > 0;

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} className="relative z-50">
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />}

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className="bg-[#262631] rounded-xl w-full max-w-2xl shadow-2xl text-white max-h-[90vh] flex flex-col border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700 shrink-0">
            <Dialog.Title className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#7140F4]" />
              Edit Project <span className="text-gray-400 font-normal ml-1">/ {projectName}</span>
            </Dialog.Title>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className={`p-6 overflow-y-auto ${scrollbarClass} space-y-6`}>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center justify-between">
                <span>Files on Server</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{filesOnServer.length}</span>
              </h3>

              <div className={`bg-[#30303d] rounded-lg border border-gray-700 overflow-hidden`}>
                {filesOnServer.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 italic text-sm">No files in this project yet.</div>
                ) : (
                  <ul className={`max-h-48 overflow-y-auto ${scrollbarClass} divide-y divide-gray-700/50`}>
                    {filesOnServer.map((fn) => {
                      const isDeleted = filesToDelete.includes(fn);
                      return (
                        <li
                          key={fn}
                          className={`flex justify-between items-center p-3 transition-colors ${isDeleted ? 'bg-red-500/5' : 'hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileJson className={`w-4 h-4 shrink-0 ${isDeleted ? 'text-red-400' : 'text-[#7140F4]'}`} />
                            <span className={`text-sm truncate ${isDeleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{fn}</span>
                            {isDeleted && (
                              <span className="text-[10px] text-red-400 font-bold px-1.5 py-0.5 border border-red-400/30 rounded bg-red-400/10">
                                PENDING DELETE
                              </span>
                            )}
                          </div>

                          {isDeleted ? (
                            <button
                              onClick={() => handleUndoDeletion(fn)}
                              disabled={loading}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs"
                              title="Undo deletion"
                            >
                              <Undo2 className="w-4 h-4" />
                              Undo
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkForDeletion(fn)}
                              disabled={loading}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer"
                              title="Mark for deletion"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Upload New Files</h3>

              <div
                className={`border-2 border-dashed rounded-lg p-5 transition-all text-center
                    ${isDragging ? 'border-[#7140F4] bg-[#7140F4]/10' : 'border-gray-600 bg-[#30303d] hover:border-gray-500'}
                 `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {filesToUpload.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-4 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-[#7140F4]' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-300 font-medium">Click to browse or drag JSON files</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ul className={`max-h-32 overflow-y-auto ${scrollbarClass} text-left space-y-1`}>
                      {filesToUpload.map((f, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center bg-[#262631] px-3 py-2 rounded border border-gray-700/50"
                        >
                          <span className="text-sm text-gray-200 truncate flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                            {f.name}
                          </span>
                          <button
                            onClick={() => handleRemoveUpload(idx)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#7140F4] hover:text-[#8b61ff] font-medium cursor-pointer"
                    >
                      + Add more files
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" multiple accept=".json" onChange={handleFileSelect} className="hidden" />
              </div>
            </div>

            {hasChanges && (
              <div className="flex items-start gap-2 text-xs bg-[#7140F4]/10 border border-[#7140F4]/20 p-3 rounded-lg text-gray-300">
                <AlertCircle className="w-4 h-4 text-[#7140F4] shrink-0 mt-0.5" />
                <p>
                  You have pending changes:
                  <span className="text-white font-medium ml-1">
                    {filesToDelete.length > 0 && `${filesToDelete.length} to delete`}
                    {filesToDelete.length > 0 && filesToUpload.length > 0 && ', '}
                    {filesToUpload.length > 0 && `${filesToUpload.length} to upload`}
                  </span>
                  .
                  <br />
                  Click "Save Changes" to apply.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-gray-700 shrink-0 bg-[#262631] rounded-b-xl">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#7140F4] hover:bg-[#5e2ff0] text-white shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
