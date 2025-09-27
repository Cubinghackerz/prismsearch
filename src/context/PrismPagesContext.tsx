import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useUser } from '@clerk/clerk-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type PrismPagesMode = 'standard' | 'sigma' | 'vector' | 'atomis';

export interface PrismPagesVersion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mode: PrismPagesMode;
  summary?: string;
  aiGenerated?: boolean;
}

export interface PrismPagesDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  mode: PrismPagesMode;
  versions: PrismPagesVersion[];
}

export interface PrismPagesRevisionProposal {
  id: string;
  summary: string;
  updatedContent: string;
  rationale?: string;
  mode: PrismPagesMode;
}

interface PrismPagesContextValue {
  documents: PrismPagesDocument[];
  selectedDocumentId: string | null;
  isLoading: boolean;
  selectDocument: (id: string | null) => void;
  createDocument: (mode?: PrismPagesMode) => PrismPagesDocument | null;
  renameDocument: (id: string, title: string) => void;
  updateDocumentContent: (id: string, content: string) => void;
  updateDocumentMode: (id: string, mode: PrismPagesMode) => void;
  deleteDocument: (id: string) => void;
  recordVersion: (id: string, summary?: string, aiGenerated?: boolean) => void;
  restoreVersion: (id: string, versionId: string) => void;
  requestAiRevision: (
    id: string,
    instructions: string
  ) => Promise<PrismPagesRevisionProposal | null>;
  applyRevision: (id: string, revision: PrismPagesRevisionProposal) => void;
  maxDocuments: number;
}

const PrismPagesContext = createContext<PrismPagesContextValue | undefined>(undefined);

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

const STORAGE_VERSION = 1;

interface StoredState {
  version: number;
  documents: PrismPagesDocument[];
  selectedDocumentId: string | null;
}

const getStorageKey = (userId: string) => `prism-pages-store-${userId}`;

const parseAssistantResponse = (response: string) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }
    const parsed = JSON.parse(jsonMatch[0]);
    if (
      typeof parsed !== 'object' ||
      !parsed
    ) {
      return null;
    }
    const summary = typeof parsed.summary === 'string' ? parsed.summary : 'Suggested updates';
    const updatedContent = typeof parsed.updatedContent === 'string'
      ? parsed.updatedContent
      : typeof parsed.updatedHtml === 'string'
        ? parsed.updatedHtml
        : null;
    if (!updatedContent) {
      return null;
    }
    return {
      summary,
      updatedContent,
      rationale: typeof parsed.rationale === 'string' ? parsed.rationale : undefined,
    };
  } catch (error) {
    console.warn('Failed to parse Prism Pages assistant response', error);
    return null;
  }
};

export const PrismPagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState<PrismPagesDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      setDocuments([]);
      setSelectedDocumentId(null);
      setIsLoading(false);
      return;
    }

    const storageKey = getStorageKey(user.id);
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (!raw) {
        setDocuments([]);
        setSelectedDocumentId(null);
        setIsLoading(false);
        return;
      }
      const parsed: StoredState = JSON.parse(raw);
      if (parsed.version !== STORAGE_VERSION) {
        throw new Error('Outdated storage version');
      }
      setDocuments(parsed.documents || []);
      setSelectedDocumentId(parsed.selectedDocumentId || null);
    } catch (error) {
      console.warn('Failed to load Prism Pages state', error);
      setDocuments([]);
      setSelectedDocumentId(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (!user || !isLoaded) {
      return;
    }
    const storageKey = getStorageKey(user.id);
    try {
      const payload: StoredState = {
        version: STORAGE_VERSION,
        documents,
        selectedDocumentId,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(payload));
      }
    } catch (error) {
      console.warn('Failed to persist Prism Pages state', error);
    }
  }, [documents, selectedDocumentId, user, isLoaded]);

  const selectDocument = useCallback((id: string | null) => {
    setSelectedDocumentId(id);
  }, []);

  const createDocument = useCallback(
    (mode: PrismPagesMode = 'standard') => {
      if (!user) {
        toast.error('You need to be signed in to create documents.');
        return null;
      }

      if (!EXCLUSIVE_USER_IDS.has(user.id)) {
        toast('Prism Pages beta', {
          description: 'Prism Pages is currently limited to invited accounts.',
        });
        return null;
      }

      if (documents.length >= 10) {
        toast('Document limit reached', {
          description: 'Prism Pages beta supports up to 10 documents per account.',
        });
        return null;
      }

      const now = new Date().toISOString();
      const newDocument: PrismPagesDocument = {
        id: uuidv4(),
        title: 'Untitled page',
        content: '<p></p>',
        createdAt: now,
        updatedAt: now,
        mode,
        versions: [],
      };

      setDocuments((prev) => [newDocument, ...prev]);
      setSelectedDocumentId(newDocument.id);
      return newDocument;
    },
    [documents.length, user]
  );

  const renameDocument = useCallback((id: string, title: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              title,
              updatedAt: new Date().toISOString(),
            }
          : doc
      )
    );
  }, []);

  const updateDocumentContent = useCallback((id: string, content: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              content,
              updatedAt: new Date().toISOString(),
            }
          : doc
      )
    );
  }, []);

  const updateDocumentMode = useCallback((id: string, mode: PrismPagesMode) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              mode,
              updatedAt: new Date().toISOString(),
            }
          : doc
      )
    );
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setSelectedDocumentId((current) => (current === id ? null : current));
  }, []);

  const recordVersion = useCallback(
    (id: string, summary?: string, aiGenerated?: boolean) => {
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id !== id) {
            return doc;
          }
          const version: PrismPagesVersion = {
            id: uuidv4(),
            title: doc.title,
            content: doc.content,
            createdAt: new Date().toISOString(),
            mode: doc.mode,
            summary,
            aiGenerated,
          };
          const versions = [version, ...doc.versions].slice(0, 50);
          return {
            ...doc,
            versions,
          };
        })
      );
    },
    []
  );

  const restoreVersion = useCallback((id: string, versionId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== id) {
          return doc;
        }
        const version = doc.versions.find((entry) => entry.id === versionId);
        if (!version) {
          toast.error('Version not found');
          return doc;
        }
        return {
          ...doc,
          title: version.title,
          content: version.content,
          mode: version.mode,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const requestAiRevision = useCallback(
    async (id: string, instructions: string) => {
      const document = documents.find((doc) => doc.id === id);
      if (!document) {
        toast.error('Document not found.');
        return null;
      }

      if (!instructions.trim()) {
        toast('Add some guidance', {
          description: 'Tell Prism Pages what you would like to improve.',
        });
        return null;
      }

      const prompt = `You are the Prism Pages writing assistant.\nMode: ${document.mode}.\nTitle: ${document.title}.\nInstructions: ${instructions}.\nDocument HTML: ${document.content}.\nReturn a JSON object with keys summary, updatedContent (HTML string), and rationale. Updated content must preserve necessary HTML structure.`;

      try {
        const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
          body: {
            query: prompt,
            chatId: `prism-pages-${id}`,
            chatHistory: [],
            model: 'gemini-pro',
          },
        });

        if (error) {
          console.error('Prism Pages assistant error', error);
          toast.error('Prism Pages assistant failed. Try again shortly.');
          return null;
        }

        const assistantResponse = typeof data?.response === 'string' ? data.response : '';
        const parsed = parseAssistantResponse(assistantResponse);
        if (!parsed) {
          toast('Assistant returned unexpected format', {
            description: 'Try rephrasing your request or be more specific.',
          });
          return null;
        }

        const revision: PrismPagesRevisionProposal = {
          id: uuidv4(),
          summary: parsed.summary,
          updatedContent: parsed.updatedContent,
          rationale: parsed.rationale,
          mode: document.mode,
        };
        return revision;
      } catch (error) {
        console.error('Failed to request Prism Pages revision', error);
        toast.error('Unable to reach Prism Pages assistant right now.');
        return null;
      }
    },
    [documents]
  );

  const applyRevision = useCallback(
    (id: string, revision: PrismPagesRevisionProposal) => {
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id !== id) {
            return doc;
          }
          const version: PrismPagesVersion = {
            id: uuidv4(),
            title: doc.title,
            content: revision.updatedContent,
            createdAt: new Date().toISOString(),
            mode: revision.mode,
            summary: revision.summary,
            aiGenerated: true,
          };
          const versions = [version, ...doc.versions].slice(0, 50);
          return {
            ...doc,
            content: revision.updatedContent,
            updatedAt: new Date().toISOString(),
            versions,
          };
        })
      );
    },
    []
  );

  const value = useMemo<PrismPagesContextValue>(
    () => ({
      documents,
      selectedDocumentId,
      isLoading: isLoading && isLoaded,
      selectDocument,
      createDocument,
      renameDocument,
      updateDocumentContent,
      updateDocumentMode,
      deleteDocument,
      recordVersion,
      restoreVersion,
      requestAiRevision,
      applyRevision,
      maxDocuments: 10,
    }),
    [
      documents,
      selectedDocumentId,
      isLoading,
      isLoaded,
      selectDocument,
      createDocument,
      renameDocument,
      updateDocumentContent,
      updateDocumentMode,
      deleteDocument,
      recordVersion,
      restoreVersion,
      requestAiRevision,
      applyRevision,
    ]
  );

  return <PrismPagesContext.Provider value={value}>{children}</PrismPagesContext.Provider>;
};

export const usePrismPages = () => {
  const context = useContext(PrismPagesContext);
  if (!context) {
    throw new Error('usePrismPages must be used within a PrismPagesProvider');
  }
  return context;
};
