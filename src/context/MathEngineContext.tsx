import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import JSZip from 'jszip';
import {
  mathEngineDB,
  type MathEngineFramework,
  type MathEngineFileRecord,
  type MathEngineProjectRecord,
  type MathEngineSnapshotRecord,
} from './MathEngineDatabase';
import {
  MATH_ENGINE_TEMPLATES,
  type MathEngineTemplateDefinition,
  type MathEngineTemplateId,
  getTemplateById,
} from '@/components/math-engine/mathEngineTemplates';

export interface MathEngineFile {
  path: string;
  content: string;
  hash: string;
  updatedAt: string;
}

export interface MathEngineSnapshot {
  id: string;
  projectId: string;
  order: number;
  createdAt: string;
  label?: string;
  files: MathEngineFile[];
}

export interface MathEngineProject {
  id: string;
  name: string;
  framework: MathEngineFramework;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, unknown>;
  files: MathEngineFile[];
  snapshots: MathEngineSnapshot[];
  snapshotIndex: number;
  entryFile: string;
}

interface MathEngineContextValue {
  projects: MathEngineProject[];
  isLoading: boolean;
  activeProjectId: string | null;
  selectProject: (projectId: string) => void;
  createProject: (
    templateId: MathEngineTemplateId,
    name?: string
  ) => Promise<MathEngineProject | null>;
  duplicateProject: (projectId: string) => Promise<MathEngineProject | null>;
  renameProject: (projectId: string, name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createFile: (projectId: string, path: string, content?: string) => Promise<void>;
  updateFile: (
    projectId: string,
    path: string,
    content: string,
    options?: { snapshotLabel?: string; skipSnapshot?: boolean }
  ) => Promise<void>;
  deleteFile: (projectId: string, path: string) => Promise<void>;
  renameFile: (
    projectId: string,
    currentPath: string,
    nextPath: string
  ) => Promise<void>;
  undo: (projectId: string) => Promise<boolean>;
  redo: (projectId: string) => Promise<boolean>;
  exportProject: (projectId: string) => Promise<Blob | null>;
  importProject: (file: File) => Promise<MathEngineProject | null>;
  maxProjects: number;
  templates: MathEngineTemplateDefinition[];
}

const ACTIVE_PROJECT_STORAGE_KEY = 'math_engine_active_project';
const MAX_PROJECTS = 10;

const MathEngineContext = createContext<MathEngineContextValue | undefined>(undefined);

const mapProjectRecord = async (
  record: MathEngineProjectRecord
): Promise<MathEngineProject> => {
  const files = await mathEngineDB.files
    .where('projectId')
    .equals(record.id)
    .toArray();
  const snapshotsRecords = await mathEngineDB.snapshots
    .where('projectId')
    .equals(record.id)
    .sortBy('order');

  return {
    id: record.id,
    name: record.name,
    framework: record.framework,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    settings: record.settings,
    entryFile:
      typeof record.settings?.entryFile === 'string'
        ? (record.settings.entryFile as string)
        : inferEntryFile(record.framework, files),
    files: files.map((file) => ({
      path: file.path,
      content: file.content,
      hash: file.hash,
      updatedAt: file.updatedAt,
    })),
    snapshots: snapshotsRecords.map((snapshot) => ({
      id: snapshot.id,
      projectId: snapshot.projectId,
      order: snapshot.order,
      createdAt: snapshot.createdAt,
      label: snapshot.label,
      files: JSON.parse(snapshot.files) as MathEngineFile[],
    })),
    snapshotIndex: record.snapshotIndex ?? 0,
  };
};

const inferEntryFile = (
  framework: MathEngineFramework,
  files: MathEngineFileRecord[]
): string => {
  if (framework === 'react') {
    if (files.some((file) => file.path === 'src/App.tsx')) {
      return 'src/App.tsx';
    }
    if (files.some((file) => file.path === 'src/App.jsx')) {
      return 'src/App.jsx';
    }
  }

  const htmlEntry = files.find((file) => file.path === 'index.html');
  if (htmlEntry) {
    return htmlEntry.path;
  }

  return files[0]?.path ?? 'index.html';
};

const hashContent = (content: string) => CryptoJS.SHA1(content).toString();

const readFileEntriesFromZip = async (file: File) => {
  const zip = await JSZip.loadAsync(file);
  const entries = await Promise.all(
    Object.values(zip.files)
      .filter((entry) => !entry.dir)
      .map(async (entry) => ({
        path: entry.name,
        content: await entry.async('string'),
      }))
  );

  return entries;
};

const detectFrameworkFromFiles = (
  files: { path: string; content: string }[]
): MathEngineFramework => {
  if (files.some((file) => /react/i.test(file.content) || file.path.endsWith('.tsx'))) {
    return 'react';
  }
  return 'vanilla';
};

export const MathEngineProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [projects, setProjects] = useState<MathEngineProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to read active Math Engine project', error);
      return null;
    }
  });

  const refreshProjects = useCallback(async () => {
    const projectRecords = await mathEngineDB.projects.orderBy('updatedAt').reverse().toArray();
    const mapped = await Promise.all(projectRecords.map(mapProjectRecord));
    setProjects(mapped);
    setIsLoading(false);

    if (!mapped.length) {
      setActiveProjectId(null);
      return;
    }

    setActiveProjectId((current) => {
      if (current && mapped.some((project) => project.id === current)) {
        return current;
      }
      return mapped[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (activeProjectId) {
        localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist active Math Engine project', error);
    }
  }, [activeProjectId]);

  const persistSnapshot = useCallback(
    async (
      projectId: string,
      label?: string
    ) => {
      const projectRecord = await mathEngineDB.projects.get(projectId);
      if (!projectRecord) {
        return;
      }

      const currentIndex = projectRecord.snapshotIndex ?? 0;
      await mathEngineDB.snapshots
        .where('projectId')
        .equals(projectId)
        .and((snapshot) => snapshot.order > currentIndex)
        .delete();

      const files = await mathEngineDB.files.where('projectId').equals(projectId).toArray();
      const snapshot: MathEngineSnapshotRecord = {
        id: uuidv4(),
        projectId,
        order: currentIndex + 1,
        createdAt: new Date().toISOString(),
        label,
        files: JSON.stringify(
          files.map((file) => ({
            path: file.path,
            content: file.content,
            hash: file.hash,
            updatedAt: file.updatedAt,
          }))
        ),
      };

      await mathEngineDB.transaction('rw', mathEngineDB.snapshots, mathEngineDB.projects, async () => {
        await mathEngineDB.snapshots.add(snapshot);
        await mathEngineDB.projects.update(projectId, {
          snapshotIndex: snapshot.order,
          updatedAt: snapshot.createdAt,
        });
      });
    },
    []
  );

  const createProject = useCallback<MathEngineContextValue['createProject']>(
    async (templateId, name) => {
      const template = getTemplateById(templateId);
      if (!template) {
        console.warn('Unknown template requested', templateId);
        return null;
      }

      const projectCount = await mathEngineDB.projects.count();
      if (projectCount >= MAX_PROJECTS) {
        return null;
      }

      const id = uuidv4();
      const createdAt = new Date().toISOString();
      const projectRecord: MathEngineProjectRecord = {
        id,
        name: name?.trim() || `${template.name} Project`,
        framework: template.framework,
        createdAt,
        updatedAt: createdAt,
        settings: { entryFile: template.entryFile },
        snapshotIndex: 0,
      };

      const files: MathEngineFileRecord[] = Object.entries(template.files).map(
        ([path, content]) => ({
          projectId: id,
          path,
          content,
          hash: hashContent(content),
          updatedAt: createdAt,
        })
      );

      const initialSnapshot: MathEngineSnapshotRecord = {
        id: uuidv4(),
        projectId: id,
        order: 0,
        createdAt,
        label: 'Initial template',
        files: JSON.stringify(
          files.map((file) => ({
            path: file.path,
            content: file.content,
            hash: file.hash,
            updatedAt: file.updatedAt,
          }))
        ),
      };

      await mathEngineDB.transaction(
        'rw',
        mathEngineDB.projects,
        mathEngineDB.files,
        mathEngineDB.snapshots,
        async () => {
          await mathEngineDB.projects.add(projectRecord);
          await mathEngineDB.files.bulkAdd(files);
          await mathEngineDB.snapshots.add(initialSnapshot);
        }
      );

      await refreshProjects();
      setActiveProjectId(id);
      const stored = await mathEngineDB.projects.get(id);
      if (!stored) {
        return null;
      }
      return mapProjectRecord(stored);
    },
    [refreshProjects]
  );

  const duplicateProject = useCallback<MathEngineContextValue['duplicateProject']>(
    async (projectId) => {
      const project = projects.find((candidate) => candidate.id === projectId);
      if (!project) {
        return null;
      }

      const projectCount = await mathEngineDB.projects.count();
      if (projectCount >= MAX_PROJECTS) {
        return null;
      }

      const id = uuidv4();
      const createdAt = new Date().toISOString();
      const projectRecord: MathEngineProjectRecord = {
        id,
        name: `${project.name} Copy`,
        framework: project.framework,
        createdAt,
        updatedAt: createdAt,
        settings: { entryFile: project.entryFile },
        snapshotIndex: 0,
      };

      const files: MathEngineFileRecord[] = project.files.map((file) => ({
        projectId: id,
        path: file.path,
        content: file.content,
        hash: hashContent(file.content),
        updatedAt: createdAt,
      }));

      const snapshot: MathEngineSnapshotRecord = {
        id: uuidv4(),
        projectId: id,
        order: 0,
        createdAt,
        label: 'Duplicated project',
        files: JSON.stringify(
          files.map((file) => ({
            path: file.path,
            content: file.content,
            hash: file.hash,
            updatedAt: file.updatedAt,
          }))
        ),
      };

      await mathEngineDB.transaction(
        'rw',
        mathEngineDB.projects,
        mathEngineDB.files,
        mathEngineDB.snapshots,
        async () => {
          await mathEngineDB.projects.add(projectRecord);
          await mathEngineDB.files.bulkAdd(files);
          await mathEngineDB.snapshots.add(snapshot);
        }
      );

      await refreshProjects();
      setActiveProjectId(id);
      const stored = await mathEngineDB.projects.get(id);
      if (!stored) {
        return null;
      }
      return mapProjectRecord(stored);
    },
    [projects, refreshProjects]
  );

  const renameProject = useCallback<MathEngineContextValue['renameProject']>(
    async (projectId, name) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      await mathEngineDB.projects.update(projectId, {
        name: trimmed,
        updatedAt: new Date().toISOString(),
      });
      await refreshProjects();
    },
    [refreshProjects]
  );

  const deleteProject = useCallback<MathEngineContextValue['deleteProject']>(
    async (projectId) => {
      await mathEngineDB.transaction(
        'rw',
        mathEngineDB.projects,
        mathEngineDB.files,
        mathEngineDB.snapshots,
        async () => {
          await mathEngineDB.projects.delete(projectId);
          await mathEngineDB.files.where('projectId').equals(projectId).delete();
          await mathEngineDB.snapshots.where('projectId').equals(projectId).delete();
        }
      );
      await refreshProjects();
    },
    [refreshProjects]
  );

  const createFile = useCallback<MathEngineContextValue['createFile']>(
    async (projectId, path, content = '') => {
      const existing = await mathEngineDB.files.get([projectId, path]);
      if (existing) {
        throw new Error('File already exists');
      }

      const now = new Date().toISOString();
      await mathEngineDB.files.add({
        projectId,
        path,
        content,
        hash: hashContent(content),
        updatedAt: now,
      });
      await mathEngineDB.projects.update(projectId, {
        updatedAt: now,
      });
      await persistSnapshot(projectId, `Created ${path}`);
      await refreshProjects();
    },
    [persistSnapshot, refreshProjects]
  );

  const updateFile = useCallback<MathEngineContextValue['updateFile']>(
    async (projectId, path, content, options) => {
      const now = new Date().toISOString();
      await mathEngineDB.files.put({
        projectId,
        path,
        content,
        hash: hashContent(content),
        updatedAt: now,
      });
      await mathEngineDB.projects.update(projectId, { updatedAt: now });

      if (!options?.skipSnapshot) {
        await persistSnapshot(projectId, options?.snapshotLabel ?? `Updated ${path}`);
      }

      await refreshProjects();
    },
    [persistSnapshot, refreshProjects]
  );

  const deleteFile = useCallback<MathEngineContextValue['deleteFile']>(
    async (projectId, path) => {
      await mathEngineDB.files.delete([projectId, path]);
      await mathEngineDB.projects.update(projectId, {
        updatedAt: new Date().toISOString(),
      });
      await persistSnapshot(projectId, `Deleted ${path}`);
      await refreshProjects();
    },
    [persistSnapshot, refreshProjects]
  );

  const renameFile = useCallback<MathEngineContextValue['renameFile']>(
    async (projectId, currentPath, nextPath) => {
      if (currentPath === nextPath) {
        return;
      }

      const existing = await mathEngineDB.files.get([projectId, nextPath]);
      if (existing) {
        throw new Error('Target file already exists');
      }

      const file = await mathEngineDB.files.get([projectId, currentPath]);
      if (!file) {
        return;
      }

      const now = new Date().toISOString();
      await mathEngineDB.transaction('rw', mathEngineDB.files, async () => {
        await mathEngineDB.files.delete([projectId, currentPath]);
        await mathEngineDB.files.add({
          projectId,
          path: nextPath,
          content: file.content,
          hash: hashContent(file.content),
          updatedAt: now,
        });
      });

      await mathEngineDB.projects.update(projectId, { updatedAt: now });
      await persistSnapshot(projectId, `Renamed ${currentPath}`);
      await refreshProjects();
    },
    [persistSnapshot, refreshProjects]
  );

  const undo = useCallback<MathEngineContextValue['undo']>(
    async (projectId) => {
      const project = await mathEngineDB.projects.get(projectId);
      if (!project || project.snapshotIndex <= 0) {
        return false;
      }

      const targetIndex = project.snapshotIndex - 1;
      const snapshot = await mathEngineDB.snapshots
        .where('projectId')
        .equals(projectId)
        .and((candidate) => candidate.order === targetIndex)
        .first();

      if (!snapshot) {
        return false;
      }

      const files = JSON.parse(snapshot.files) as MathEngineFile[];
      const now = new Date().toISOString();

      await mathEngineDB.transaction(
        'rw',
        mathEngineDB.files,
        mathEngineDB.projects,
        async () => {
          await mathEngineDB.files.where('projectId').equals(projectId).delete();
          await mathEngineDB.files.bulkAdd(
            files.map((file) => ({
              projectId,
              path: file.path,
              content: file.content,
              hash: file.hash ?? hashContent(file.content),
              updatedAt: now,
            }))
          );
          await mathEngineDB.projects.update(projectId, {
            snapshotIndex: targetIndex,
            updatedAt: now,
          });
        }
      );

      await refreshProjects();
      return true;
    },
    [refreshProjects]
  );

  const redo = useCallback<MathEngineContextValue['redo']>(
    async (projectId) => {
      const project = await mathEngineDB.projects.get(projectId);
      if (!project) {
        return false;
      }

      const nextIndex = project.snapshotIndex + 1;
      const snapshot = await mathEngineDB.snapshots
        .where('projectId')
        .equals(projectId)
        .and((candidate) => candidate.order === nextIndex)
        .first();

      if (!snapshot) {
        return false;
      }

      const files = JSON.parse(snapshot.files) as MathEngineFile[];
      const now = new Date().toISOString();

      await mathEngineDB.transaction(
        'rw',
        mathEngineDB.files,
        mathEngineDB.projects,
        async () => {
          await mathEngineDB.files.where('projectId').equals(projectId).delete();
          await mathEngineDB.files.bulkAdd(
            files.map((file) => ({
              projectId,
              path: file.path,
              content: file.content,
              hash: file.hash ?? hashContent(file.content),
              updatedAt: now,
            }))
          );
          await mathEngineDB.projects.update(projectId, {
            snapshotIndex: nextIndex,
            updatedAt: now,
          });
        }
      );

      await refreshProjects();
      return true;
    },
    [refreshProjects]
  );

  const exportProject = useCallback<MathEngineContextValue['exportProject']>(
    async (projectId) => {
      const project = projects.find((candidate) => candidate.id === projectId);
      if (!project) {
        return null;
      }

      const zip = new JSZip();
      project.files.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      return blob;
    },
    [projects]
  );

  const importProject = useCallback<MathEngineContextValue['importProject']>(
    async (file) => {
      const entries = await readFileEntriesFromZip(file);
      if (!entries.length) {
        return null;
      }

      const projectCount = await mathEngineDB.projects.count();
      if (projectCount >= MAX_PROJECTS) {
        return null;
      }

      const framework = detectFrameworkFromFiles(entries);
      const id = uuidv4();
      const createdAt = new Date().toISOString();

      const projectRecord: MathEngineProjectRecord = {
        id,
        name: file.name.replace(/\.zip$/i, '') || 'Imported Project',
        framework,
        createdAt,
        updatedAt: createdAt,
        settings: {},
        snapshotIndex: 0,
      };

      const files: MathEngineFileRecord[] = entries.map((entry) => ({
        projectId: id,
        path: entry.path,
        content: entry.content,
        hash: hashContent(entry.content),
        updatedAt: createdAt,
      }));

      const snapshot: MathEngineSnapshotRecord = {
        id: uuidv4(),
        projectId: id,
        order: 0,
        createdAt,
        label: 'Imported archive',
        files: JSON.stringify(
          files.map((fileRecord) => ({
            path: fileRecord.path,
            content: fileRecord.content,
            hash: fileRecord.hash,
            updatedAt: fileRecord.updatedAt,
          }))
        ),
      };

      await mathEngineDB.transaction(
        'rw',
        mathEngineDB.projects,
        mathEngineDB.files,
        mathEngineDB.snapshots,
        async () => {
          await mathEngineDB.projects.add(projectRecord);
          await mathEngineDB.files.bulkAdd(files);
          await mathEngineDB.snapshots.add(snapshot);
        }
      );

      await refreshProjects();
      setActiveProjectId(id);
      const stored = await mathEngineDB.projects.get(id);
      if (!stored) {
        return null;
      }
      return mapProjectRecord(stored);
    },
    [refreshProjects]
  );

  const selectProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
  }, []);

  const value = useMemo<MathEngineContextValue>(
    () => ({
      projects,
      isLoading,
      activeProjectId,
      selectProject,
      createProject,
      duplicateProject,
      renameProject,
      deleteProject,
      createFile,
      updateFile,
      deleteFile,
      renameFile,
      undo,
      redo,
      exportProject,
      importProject,
      maxProjects: MAX_PROJECTS,
      templates: MATH_ENGINE_TEMPLATES,
    }),
    [
      projects,
      isLoading,
      activeProjectId,
      selectProject,
      createProject,
      duplicateProject,
      renameProject,
      deleteProject,
      createFile,
      updateFile,
      deleteFile,
      renameFile,
      undo,
      redo,
      exportProject,
      importProject,
    ]
  );

  return <MathEngineContext.Provider value={value}>{children}</MathEngineContext.Provider>;
};

export const useMathEngine = () => {
  const context = useContext(MathEngineContext);
  if (!context) {
    throw new Error('useMathEngine must be used within a MathEngineProvider');
  }
  return context;
};
