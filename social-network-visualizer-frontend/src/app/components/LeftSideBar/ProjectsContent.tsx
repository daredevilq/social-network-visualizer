import { useEffect, useRef, useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import { ProjectSummary } from '@/app/interface/ProjectSummary';

const API = 'http://localhost:8080';

export default function ProjectsContent() {
	const { selected, loading, select } = useProject();
	const [projects, setProjects] = useState<ProjectSummary[]>([]);
	const [status, setStatus]     = useState<string | null>(null);
  	const fileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
	(async () => {
    	const res  = await fetch(`${API}/project/list`);
    	const list = (await res.json()) as ProjectSummary[];
    	setProjects(list);

    })().catch(console.error);
	}, []);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
	const files = e.target.files;
	
	if (!files?.length) return;

    const name = prompt('Project name:', selected ?? '')?.trim();
    if (!name) return;

    const form = new FormData();
    Array.from(files).forEach(f => form.append('files', f));

    const exists = projects.some(p => p.name === name);
    const url    = exists
    	? `${API}/project/${name}/files/add`
    	: `${API}/project/${name}`;
    const method = exists ? 'PUT' : 'POST';

    await fetch(url, { method, body: form });
    setStatus(exists ? 'Files added' : 'Project created');

    await (async () => {
    	const res  = await fetch(`${API}/project/list`);
    	const list = (await res.json()) as ProjectSummary[];
      	setProjects(list);
    })();
    await select(name);
    e.target.value = '';
  };


  return (
    <div className="relative h-full flex flex-col text-white">
    	{/* spiner ktory blokuje - trzeba jeszcze zrobic cos takiego na grafie zeby nie klikac podczas kiedy ladujemy dane */}
    	{loading && (
    	<div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
        	<svg className="animate-spin w-10 h-10 text-[#7140F4]" viewBox="0 0 24 24" fill="none">
        		<circle className="opacity-25" cx="12" cy="12" r="10"
                	stroke="currentColor" strokeWidth="4"/>
            	<path className="opacity-75" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                	fill="currentColor"/>
          	</svg>
        </div>
      )}

    	<h1 className="text-2xl font-bold border-b border-white py-2">Projects</h1>

		<div className="flex-1 overflow-y-auto">
			{projects.map(p => (
			<button
				key={p.name}
				disabled={loading}
				onClick={() => select(p.name)}
				className={`flex items-center w-full py-3 border-b border-gray-500
							hover:text-[#7140F4] ${selected === p.name && 'text-[#7140F4]'}`}
			>
				<img src={selected === p.name
							? '/icons/leftSideBar/current_project_icon.png'
							: '/icons/leftSideBar/project_icon.png'}
					className="w-7 h-7 mr-2" alt="" />
				<span className="truncate">{p.name}</span>
			</button>
			))}

			<button
				disabled={loading}
				onClick={() => fileRef.current?.click()}
				className="flex items-center w-full py-3 hover:text-[#7140F4]"
			>
				<img src="/icons/leftSideBar/plus_icon.png" className="w-7 h-7 mr-2" alt="" />
				<span>Upload file(s)</span>
				<input ref={fileRef} type="file" multiple accept=".json"
					onChange={handleUpload} className="hidden" />
			</button>
		</div>

    	{status && !loading && (
    	<p className="text-center text-sm text-[#7140F4] py-2">{status}</p>
      )}
    </div>
  );
}
