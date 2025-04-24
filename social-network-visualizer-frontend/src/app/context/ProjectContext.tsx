'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const BASE_URL = `http://localhost:8080`

interface Context {
  selected: string | null;
  loading: boolean;
  select: (name: string) => Promise<void>
}

const ProjectContext = createContext<Context>({
  selected: null,
  loading: false,
  select: async () => {},
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const select = async (name: string) => {
    if (loading || selected === name) return;
    setLoading(true);
    await fetch(`${BASE_URL}/project/import/${name}`);
    setSelected(name);
    setLoading(false);
  };

  return (
    <ProjectContext.Provider value={{ selected, loading, select }}>
      {children}
    </ProjectContext.Provider>
  );
}
