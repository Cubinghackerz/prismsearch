import { ResearchNotebook } from './researchService';

export interface SavedResearchNotebook {
  id: string;
  title: string;
  notebook: ResearchNotebook;
  createdAt: string;
  updatedAt: string;
  version: number;
}

const STORAGE_KEY = 'prism_research_saved_notebooks';
const STORAGE_VERSION = 1;

const isBrowser = typeof window !== 'undefined';

const sanitizeEntries = (entries: unknown): SavedResearchNotebook[] => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const record = entry as Partial<SavedResearchNotebook>;
      if (!record.id || !record.title || !record.notebook) {
        return null;
      }

      return {
        id: String(record.id),
        title: String(record.title),
        notebook: record.notebook as ResearchNotebook,
        createdAt: record.createdAt ?? new Date().toISOString(),
        updatedAt: record.updatedAt ?? new Date().toISOString(),
        version: typeof record.version === 'number' ? record.version : STORAGE_VERSION,
      } satisfies SavedResearchNotebook;
    })
    .filter((entry): entry is SavedResearchNotebook => Boolean(entry));
};

export const loadSavedNotebooks = (): SavedResearchNotebook[] => {
  if (!isBrowser) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as { version: number; entries: unknown } | SavedResearchNotebook[];

    if (Array.isArray(parsed)) {
      return sanitizeEntries(parsed);
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const versioned = parsed as { version?: number; entries?: unknown };
      return sanitizeEntries(versioned.entries ?? []);
    }

    return [];
  } catch (error) {
    console.warn('Unable to load saved research notebooks', error);
    return [];
  }
};

export const persistSavedNotebooks = (entries: SavedResearchNotebook[]): void => {
  if (!isBrowser) {
    return;
  }

  try {
    const payload = JSON.stringify({
      version: STORAGE_VERSION,
      entries,
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.warn('Unable to persist research notebooks', error);
  }
};

export const removeSavedNotebook = (id: string): SavedResearchNotebook[] => {
  const current = loadSavedNotebooks();
  const filtered = current.filter((entry) => entry.id !== id);
  persistSavedNotebooks(filtered);
  return filtered;
};
