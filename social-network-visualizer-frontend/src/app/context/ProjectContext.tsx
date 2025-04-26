'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const BASE_URL = `http://localhost:8080`;

interface Context {
	selected: string | null;
	loading: boolean;
	select: (name: string) => Promise<void>;
	runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

const ProjectContext = createContext<Context>({
	selected: null,
	loading: false,
	select: async () => {},
	runWithLoading: async (fn) => fn(),
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: ReactNode }) {
	const [selected, setSelected] = useState<string | null>(null);
	const [loading,  setLoading]  = useState(false);

	const runWithLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
		if (loading) return fn();
		setLoading(true);
		try {
			return await fn();
		} finally {
			setLoading(false);
		}
	};

	const select = async (name: string) =>
		runWithLoading(async () => {
			if (selected === name) return;
			await fetch(`${BASE_URL}/project/import/${name}`);
			setSelected(name);
		});

	return (
		<ProjectContext.Provider value={{ selected, loading, select, runWithLoading }}>
			{children}
		</ProjectContext.Provider>
	);
}
