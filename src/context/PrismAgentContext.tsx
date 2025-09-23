import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CodeGenerationPlan, GeneratedApp } from '@/services/codeGenerationService';

export type PrismAgentMode = 'fast' | 'thinking';

export type PrismAgentMessageType = 'user' | 'plan' | 'result' | 'info';

export interface PrismAgentMessage {
  id: string;
  role: 'user' | 'assistant';
  type: PrismAgentMessageType;
  content: string;
  createdAt: string;
  mode?: PrismAgentMode;
  plan?: CodeGenerationPlan;
  result?: GeneratedApp;
  usedModel?: string;
  rawResponse?: string;
  versionId?: string;
}

export interface PrismAgentVersion {
  id: string;
  prompt: string;
  createdAt: string;
  mode: PrismAgentMode;
  plan?: CodeGenerationPlan;
  app?: GeneratedApp;
  usedModel?: string;
  rawResponse?: string;
}

export interface PrismAgentProject {
  id: string;
  name: string;
  createdAt: string;
  messages: PrismAgentMessage[];
  versions: PrismAgentVersion[];
  activeVersionId?: string;
}

interface PrismAgentContextValue {
  projects: PrismAgentProject[];
  activeProjectId: string | null;
  createProject: (name?: string) => PrismAgentProject | null;
  renameProject: (projectId: string, name: string) => void;
  deleteProject: (projectId: string) => void;
  selectProject: (projectId: string) => void;
  addMessage: (projectId: string, message: PrismAgentMessage) => void;
  addVersion: (projectId: string, version: PrismAgentVersion) => void;
  setActiveVersion: (projectId: string, versionId: string) => void;
  maxProjects: number;
}

const PROJECTS_STORAGE_KEY = 'prism_agent_projects';
const ACTIVE_PROJECT_STORAGE_KEY = 'prism_agent_active_project';
const MAX_PROJECTS = 10;

const PrismAgentContext = createContext<PrismAgentContextValue | undefined>(undefined);

const hydrateProjects = (): PrismAgentProject[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as PrismAgentProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse stored Prism Agent projects', error);
    return [];
  }
};

export const PrismAgentProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [projects, setProjects] = useState<PrismAgentProject[]>(() => hydrateProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to read active Prism Agent project', error);
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.warn('Failed to persist Prism Agent projects', error);
    }
  }, [projects]);

  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist active Prism Agent project', error);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (projects.length === 0) {
      setActiveProjectId(null);
      return;
    }

    if (activeProjectId && projects.some((project) => project.id === activeProjectId)) {
      return;
    }

    setActiveProjectId(projects[0].id);
  }, [projects, activeProjectId]);

  const createProject = useCallback(
    (name?: string): PrismAgentProject | null => {
      if (projects.length >= MAX_PROJECTS) {
        return null;
      }

      const id = uuidv4();
      const project: PrismAgentProject = {
        id,
        name: name?.trim() || `Project ${projects.length + 1}`,
        createdAt: new Date().toISOString(),
        messages: [],
        versions: [],
        activeVersionId: undefined,
      };

      setProjects((prev) => [project, ...prev]);
      setActiveProjectId(id);
      return project;
    },
    [projects]
  );

  const renameProject = useCallback((projectId: string, name: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              name: name.trim() || project.name,
            }
          : project
      )
    );
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const updated = prev.filter((project) => project.id !== projectId);

      setActiveProjectId((current) => {
        if (!updated.length) {
          return null;
        }

        if (!current || current === projectId || !updated.some((project) => project.id === current)) {
          return updated[0].id;
        }

        return current;
      });

      return updated;
    });
  }, []);

  const selectProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
  }, []);

  const addMessage = useCallback((projectId: string, message: PrismAgentMessage) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              messages: [...project.messages, message],
            }
          : project
      )
    );
  }, []);

  const addVersion = useCallback((projectId: string, version: PrismAgentVersion) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              versions: [...project.versions, version],
              activeVersionId: version.id,
            }
          : project
      )
    );
  }, []);

  const setActiveVersion = useCallback((projectId: string, versionId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              activeVersionId: versionId,
            }
          : project
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      projects,
      activeProjectId,
      createProject,
      renameProject,
      deleteProject,
      selectProject,
      addMessage,
      addVersion,
      setActiveVersion,
      maxProjects: MAX_PROJECTS,
    }),
    [
      projects,
      activeProjectId,
      createProject,
      renameProject,
      deleteProject,
      selectProject,
      addMessage,
      addVersion,
      setActiveVersion,
    ]
  );

  return <PrismAgentContext.Provider value={value}>{children}</PrismAgentContext.Provider>;
};

export const usePrismAgent = () => {
  const context = useContext(PrismAgentContext);
  if (!context) {
    throw new Error('usePrismAgent must be used within a PrismAgentProvider');
  }

  return context;
};

