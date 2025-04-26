'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const BASE_URL = `http://localhost:8080`;

interface Context {
	selected: string | null;
	loading: boolean;
	/** import projektu (jak dotychczas) */
	select: (name: string) => Promise<void>;
	/** owijka, która włącza/wyłącza globalny loading na czas dowolnej asynch. operacji */
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

	/** jedna funkcja utrzymująca spinner, wielokrotnego użytku */
	const runWithLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
		// jeśli już coś się ładuje, nie przełączamy spinnera ponownie
		if (loading) return fn();
		setLoading(true);
		try {
			return await fn();
		} finally {
			setLoading(false);
		}
	};

	/** import projektu – teraz po prostu używa runWithLoading */
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
