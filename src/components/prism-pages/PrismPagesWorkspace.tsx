import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FilePlus,
  Highlighter,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Sparkles,
  History,
  Trash,
  Download,
  Upload,
  Moon,
  Sun,
  Sigma,
  Atom,
  Zap,
  Minus,
  Plus,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import TurndownService from 'turndown';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { usePrismPages, PrismPagesMode, PrismPagesRevisionProposal } from '@/context/PrismPagesContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MODE_OPTIONS: { value: PrismPagesMode; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'standard', label: 'Standard', description: 'Structured writing for everyday documents.', icon: <Type className="h-4 w-4" /> },
  { value: 'sigma', label: 'Sigma', description: 'Precise notation for maths and formal proofs.', icon: <Sigma className="h-4 w-4" /> },
  { value: 'vector', label: 'Vector', description: 'Physics-ready units, vectors, and diagrams.', icon: <Zap className="h-4 w-4" /> },
  { value: 'atomis', label: 'Atomis', description: 'Chemical equations, reactions, and structures.', icon: <Atom className="h-4 w-4" /> },
];

const QUICK_INSERTS: Record<PrismPagesMode, { label: string; value: string }[]> = {
  standard: [
    { label: 'Heading', value: '<h2>Section title</h2>' },
    { label: 'Checklist', value: '<ul><li>[ ] Task one</li><li>[ ] Task two</li></ul>' },
  ],
  sigma: [
    { label: 'Integral', value: '<p>∫ f(x) dx</p>' },
    { label: 'Series', value: '<p>Σ<sub>n=0</sub>^∞ aₙ</p>' },
    { label: 'Equation', value: '<p>E = mc²</p>' },
  ],
  vector: [
    { label: 'Vector', value: '<p>→v = ⟨v₁, v₂, v₃⟩</p>' },
    { label: 'Unit', value: '<p>9.81 m·s⁻²</p>' },
    { label: 'Diagram note', value: '<p>[Insert free-body diagram description]</p>' },
  ],
  atomis: [
    { label: 'Reaction', value: '<p>2H₂ + O₂ → 2H₂O</p>' },
    { label: 'Equilibrium', value: '<p>N₂ + 3H₂ ⇌ 2NH₃</p>' },
    { label: 'Molar mass', value: '<p>M(H₂O) = 18.015 g·mol⁻¹</p>' },
  ],
};

const TEMPLATE_PRESETS: {
  id: string;
  title: string;
  description: string;
  mode: PrismPagesMode;
  accent: string;
  pages?: string[];
  initialTitle?: string;
}[] = [
  {
    id: 'blank-standard',
    title: 'Blank document',
    description: 'Start from an empty canvas with rich text controls.',
    mode: 'standard',
    accent: 'from-indigo-500 via-sky-500 to-cyan-400',
  },
  {
    id: 'sigma-proof',
    title: 'Math workspace',
    description: 'Sigma mode with equation shortcuts and notation presets.',
    mode: 'sigma',
    accent: 'from-purple-500 via-indigo-500 to-blue-500',
  },
  {
    id: 'vector-lab',
    title: 'Physics lab notes',
    description: 'Vector mode with units, vectors, and diagram callouts.',
    mode: 'vector',
    accent: 'from-emerald-500 via-teal-500 to-sky-500',
  },
  {
    id: 'atomis-journal',
    title: 'Chemistry journal',
    description: 'Atomis mode with reaction templates and molecular forms.',
    mode: 'atomis',
    accent: 'from-fuchsia-500 via-rose-500 to-orange-400',
  },
  {
    id: 'report-template',
    title: 'Project report',
    description: 'Structured sections for executive summaries and briefs.',
    mode: 'standard',
    accent: 'from-slate-500 via-slate-400 to-zinc-300',
    initialTitle: 'Project report template',
    pages: [
      `<h1>Project Report</h1>
<p><strong>Prepared by:</strong> [Your name]</p>
<p><strong>Date:</strong> [Insert date]</p>
<h2>Executive summary</h2>
<p>[Summarise project objectives, major outcomes, and overall impact.]</p>
<h2>Goals &amp; scope</h2>
<ul>
  <li>Describe the primary problem or opportunity</li>
  <li>List measurable objectives and success criteria</li>
  <li>Call out assumptions and constraints</li>
</ul>
<h2>Key findings</h2>
<p>[Capture the most important discoveries, metrics, or research insights that support your recommendations.]</p>
<h2>Recommendations</h2>
<ol>
  <li>Primary action and expected result</li>
  <li>Supporting initiative with owner and timeline</li>
  <li>Risk mitigation or contingency plan</li>
</ol>
<h2>Next steps</h2>
<p>[Outline upcoming milestones, dependencies, and follow-up tasks.]</p>`
    ],
  },
];

const MODE_SYMBOL_SETS: Partial<Record<PrismPagesMode, { label: string; value: string }[]>> = {
  sigma: [
    { label: 'Summation Σ', value: 'Σ' },
    { label: 'Integral ∫', value: '∫' },
    { label: 'Pi π', value: 'π' },
    { label: 'Derivative d/dx', value: 'd/dx' },
    { label: 'Square root √', value: '√' },
    { label: 'Infinity ∞', value: '∞' },
  ],
  vector: [
    { label: 'Vector arrow →', value: '→' },
    { label: 'Vector bold v', value: '𝐯' },
    { label: 'Dot product ·', value: '·' },
    { label: 'Cross product ×', value: '×' },
    { label: 'Magnitude |v|', value: '|v|' },
    { label: 'Delta Δ', value: 'Δ' },
  ],
  atomis: [
    { label: 'Reaction arrow ⟶', value: '⟶' },
    { label: 'Equilibrium ⇌', value: '⇌' },
    { label: 'Half-life t½', value: 't½' },
    { label: 'Alpha α', value: 'α' },
    { label: 'Beta β', value: 'β' },
    { label: 'Gamma γ', value: 'γ' },
  ],
};

const turndown = new TurndownService({ headingStyle: 'atx' });

turndown.addRule('checklist', {
  filter: (node) => node instanceof HTMLElement && node.tagName === 'LI' && node.textContent?.trim().startsWith('[ ]'),
  replacement: (content) => `- [ ] ${content.trim().replace(/^\[ \]\s*/, '')}`,
});

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const htmlToPlainText = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
};

const getDocumentPreview = (html: string | undefined, limit = 90) => {
  const text = htmlToPlainText(html ?? '').trim();
  if (!text) {
    return 'Empty document';
  }
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

const markdownToHtml = (markdown: string) => {
  let html = markdown;
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  html = html.replace(/\n{2,}/gim, '</p><p>');
  html = html.replace(/\n/gim, '<br />');
  return `<p>${html}</p>`;
};

const textToHtml = (text: string) => {
  const paragraphs = text.split(/\n{2,}/).map((segment) => `<p>${segment.replace(/\n/g, '<br />')}</p>`);
  return paragraphs.join('');
};

const stripRtf = (content: string) => {
  return content
    .replace(/\{\\[^}]+\}/g, '')
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/\\[a-z]+-?\d* ?/g, '')
    .replace(/[{}]/g, '')
    .trim();
};

const createDocxFromText = async (text: string) => {
  const zip = new JSZip();
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const relsRoot = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;
  const paragraphs = text
    .split(/\n/)
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`)
    .join('');
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${
    paragraphs || '<w:p/>'
  }<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;

  zip.file('[Content_Types].xml', contentTypes);
  zip.folder('_rels')?.file('.rels', relsRoot);
  zip.folder('word')?.file('document.xml', documentXml);
  zip.folder('word')?.folder('_rels')?.file('document.xml.rels', documentRels);

  return zip.generateAsync({ type: 'blob' });
};

const PrismPagesWorkspace: React.FC = () => {
  const {
    documents,
    selectedDocumentId,
    selectDocument,
    createDocument,
    renameDocument,
    updateDocumentContent,
    updateDocumentMode,
    deleteDocument,
    addDocumentPage,
    removeDocumentPage,
    recordVersion,
    restoreVersion,
    requestAiRevision,
    applyRevision,
    maxDocuments,
    isLoading,
  } = usePrismPages();

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('dark');
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [pendingRevision, setPendingRevision] = useState<PrismPagesRevisionProposal | null>(null);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [isVersionSheetOpen, setIsVersionSheetOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [contentDraft, setContentDraft] = useState('');
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const internalUpdateRef = useRef(false);

  const currentDocument = useMemo(
    () => documents.find((doc) => doc.id === selectedDocumentId) || null,
    [documents, selectedDocumentId]
  );

  const recentDocuments = useMemo(
    () =>
      [...documents]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8),
    [documents]
  );

  useEffect(() => {
    if (!currentDocument) {
      setActivePageIndex(0);
      setContentDraft('');
      return;
    }
    setActivePageIndex((previous) => {
      if (previous < currentDocument.pages.length) {
        return previous;
      }
      return Math.max(0, currentDocument.pages.length - 1);
    });
  }, [currentDocument?.id, currentDocument?.pages?.length]);

  useEffect(() => {
    if (!currentDocument) {
      setContentDraft('');
      return;
    }
    const nextContent = currentDocument.pages[activePageIndex] ?? currentDocument.pages[0] ?? '<p></p>';
    setContentDraft((previous) => (previous === nextContent ? previous : nextContent));
  }, [currentDocument?.id, currentDocument?.pages, activePageIndex]);

  useEffect(() => {
    if (!currentDocument) {
      return;
    }
    const previousContent = currentDocument.pages[activePageIndex] ?? '';
    const debounce = window.setTimeout(() => {
      if (contentDraft !== previousContent) {
        updateDocumentContent(currentDocument.id, contentDraft, activePageIndex);
      }
    }, 500);

    return () => window.clearTimeout(debounce);
  }, [contentDraft, currentDocument, activePageIndex, updateDocumentContent]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }
    if (editorRef.current.innerHTML !== contentDraft) {
      editorRef.current.innerHTML = contentDraft;
    }
  }, [contentDraft]);

  useEffect(() => {
    setIsHighlightMode(false);
  }, [currentDocument?.id, activePageIndex]);

  const syncEditorContent = () => {
    if (!editorRef.current) {
      return;
    }
    const updated = editorRef.current.innerHTML;
    internalUpdateRef.current = true;
    setContentDraft(updated);
  };

  const runCommand = (command: string, value?: string) => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.focus();
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const insertSnippet = (snippet: string) => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.focus();
    document.execCommand('insertHTML', false, snippet);
    syncEditorContent();
  };

  const insertSymbol = (symbol: string) => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.focus();
    const inserted = document.execCommand('insertText', false, symbol);
    if (!inserted) {
      document.execCommand('insertHTML', false, symbol);
    }
    syncEditorContent();
  };

  const toggleHighlightMode = () => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.focus();
    const selection = window.getSelection();
    const hasSelection = !!selection && selection.rangeCount > 0 && !selection.isCollapsed;

    document.execCommand('styleWithCSS', false, true);

    if (hasSelection) {
      document.execCommand('hiliteColor', false, '#facc15');
      selection?.collapseToEnd();
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('styleWithCSS', false, false);
      syncEditorContent();
      setIsHighlightMode(false);
      return;
    }

    const next = !isHighlightMode;
    document.execCommand('hiliteColor', false, next ? '#facc15' : 'transparent');
    document.execCommand('styleWithCSS', false, false);
    setIsHighlightMode(next);
    syncEditorContent();
  };

  const handleCreate = (options?: { templateId?: string; mode?: PrismPagesMode }) => {
    const template = options?.templateId
      ? TEMPLATE_PRESETS.find((preset) => preset.id === options.templateId)
      : undefined;
    const doc = createDocument({
      mode: template?.mode ?? options?.mode ?? 'standard',
      title: template?.initialTitle ?? template?.title,
      pages: template?.pages,
    });
    if (!doc) {
      return;
    }
    toast.success(`Created ${doc.title}`);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) {
      return;
    }
    deleteDocument(id);
  };

  const handleRequestRevision = async () => {
    if (!currentDocument) {
      return;
    }
    setIsRequestingRevision(true);
    const revision = await requestAiRevision(currentDocument.id, aiInstructions);
    setIsRequestingRevision(false);
    if (revision) {
      setPendingRevision(revision);
    }
  };

  const handleEditorInput = (event: React.FormEvent<HTMLDivElement>) => {
    internalUpdateRef.current = true;
    setContentDraft(event.currentTarget.innerHTML);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'docx' | 'pdf' | 'odt' | 'rtf' | 'txt' | 'md') => {
    if (!currentDocument) {
      toast.error('Select a document first.');
      return;
    }

    const filenameBase = currentDocument.title.replace(/[^a-z0-9\- ]/gi, '_') || 'prism-pages';
    const html = currentDocument.content;
    const plain = htmlToPlainText(html);

    switch (format) {
      case 'docx': {
        const blob = await createDocxFromText(plain);
        downloadFile(blob, `${filenameBase}.docx`);
        toast.success('Exported .docx');
        break;
      }
      case 'pdf': {
        const instance = new jsPDF({ unit: 'pt', format: 'a4' });
        if (editorRef.current) {
          await instance.html(editorRef.current, {
            callback: (doc) => {
              doc.save(`${filenameBase}.pdf`);
              toast.success('Exported .pdf');
            },
            margin: [40, 40, 40, 40],
            autoPaging: 'text',
          });
        } else {
          instance.text(plain, 40, 40);
          instance.save(`${filenameBase}.pdf`);
          toast.success('Exported .pdf');
        }
        break;
      }
      case 'odt': {
        const zip = new JSZip();
        zip.file('mimetype', 'application/vnd.oasis.opendocument.text');
        const contentXml = `<?xml version="1.0" encoding="UTF-8"?>\n<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:p>${escapeXml(
          plain.replace(/\n/g, '</text:p><text:p>')
        )}</text:p></office:text></office:body></office:document-content>`;
        zip.file('content.xml', contentXml);
        const manifest = `<?xml version="1.0" encoding="UTF-8"?>\n<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"><manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/><manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/></manifest:manifest>`;
        zip.file('META-INF/manifest.xml', manifest);
        const blob = await zip.generateAsync({ type: 'blob' });
        downloadFile(blob, `${filenameBase}.odt`);
        toast.success('Exported .odt');
        break;
      }
      case 'rtf': {
        const rtfBody = plain
          .split('\n')
          .map((line) => `${line.replace(/\\/g, '\\\\').replace(/[{}]/g, '')}\\par`)
          .join('\n');
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\viewkind4\\uc1\\pard ${rtfBody}}`;
        downloadFile(new Blob([rtf], { type: 'application/rtf' }), `${filenameBase}.rtf`);
        toast.success('Exported .rtf');
        break;
      }
      case 'txt': {
        downloadFile(new Blob([plain], { type: 'text/plain;charset=utf-8' }), `${filenameBase}.txt`);
        toast.success('Exported .txt');
        break;
      }
      case 'md': {
        const markdown = turndown.turndown(html);
        downloadFile(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }), `${filenameBase}.md`);
        toast.success('Exported .md');
        break;
      }
      default:
        break;
    }
  };

  const importDocx = async (arrayBuffer: ArrayBuffer) => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    if (!documentXml) {
      return '';
    }
    const parser = new DOMParser();
    const xml = parser.parseFromString(documentXml, 'application/xml');
    const texts = Array.from(xml.getElementsByTagName('w:t')).map((node) => node.textContent ?? '');
    return textToHtml(texts.join(' '));
  };

  const importOdt = async (arrayBuffer: ArrayBuffer) => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const contentXml = await zip.file('content.xml')?.async('string');
    if (!contentXml) {
      return '';
    }
    const parser = new DOMParser();
    const xml = parser.parseFromString(contentXml, 'application/xml');
    const paragraphs = Array.from(xml.getElementsByTagName('text:p')).map((node) => node.textContent ?? '');
    return textToHtml(paragraphs.join('\n'));
  };

  const importPdf = async (arrayBuffer: ArrayBuffer) => {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    }
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const textContent: string[] = [];
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      textContent.push(pageText);
    }
    return textToHtml(textContent.join('\n'));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentDocument) {
      toast.error('Select a document first.');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsImporting(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      let html = '';
      if (extension === 'docx') {
        html = await importDocx(arrayBuffer);
      } else if (extension === 'odt') {
        html = await importOdt(arrayBuffer);
      } else if (extension === 'pdf') {
        html = await importPdf(arrayBuffer);
      } else if (extension === 'rtf') {
        const text = stripRtf(new TextDecoder().decode(arrayBuffer));
        html = textToHtml(text);
      } else if (extension === 'txt') {
        const text = new TextDecoder().decode(arrayBuffer);
        html = textToHtml(text);
      } else if (extension === 'md') {
        const text = new TextDecoder().decode(arrayBuffer);
        html = markdownToHtml(text);
      } else {
        toast.error('Unsupported import format.');
        return;
      }
      setContentDraft(html);
      updateDocumentContent(currentDocument.id, html);
      setActivePageIndex(0);
      toast.success(`Imported ${file.name}`);
    } catch (error) {
      console.error('Failed to import document', error);
      toast.error('Import failed');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleSelectPage = (index: number) => {
    if (!currentDocument) {
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, currentDocument.pages.length - 1));
    setActivePageIndex(safeIndex);
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  };

  const handleAddPage = () => {
    if (!currentDocument) {
      return;
    }
    addDocumentPage(currentDocument.id, activePageIndex);
    setActivePageIndex((previous) => Math.min(previous + 1, currentDocument.pages.length));
    toast.success('Added a new page');
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  };

  const handleRemovePage = () => {
    if (!currentDocument) {
      return;
    }
    if (currentDocument.pages.length <= 1) {
      toast('Cannot remove page', {
        description: 'Documents must contain at least one page.',
      });
      return;
    }
    const nextLength = Math.max(1, currentDocument.pages.length - 1);
    removeDocumentPage(currentDocument.id, activePageIndex);
    setActivePageIndex((previous) => {
      if (previous >= nextLength) {
        return Math.max(0, nextLength - 1);
      }
      return previous;
    });
    toast.success('Removed page');
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  };

  const renderSidebar = () => (
    <div className="hidden h-full w-72 flex-col gap-5 border-r border-slate-800/70 bg-slate-950/70 p-5 lg:flex">
      <div className="space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Library</h2>
        <p className="text-[11px] text-slate-500">{documents.length}/{maxDocuments} documents stored on this device</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl border-slate-700/80 bg-slate-900/60 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10"
          >
            <FilePlus className="h-4 w-4" /> New document
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 border-slate-800 bg-slate-900 text-slate-100">
          {MODE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="focus:bg-indigo-500/10 focus:text-indigo-200"
              onClick={() => handleCreate({ mode: option.value })}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-slate-400">{option.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => selectDocument(doc.id)}
              className={`group rounded-xl border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                doc.id === currentDocument?.id
                  ? 'border-indigo-400/60 bg-indigo-500/10 text-indigo-100'
                  : 'border-slate-800/70 bg-slate-900/40 text-slate-200 hover:border-indigo-400/40 hover:bg-indigo-500/5'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{doc.title}</p>
                <Badge variant="outline" className="border-transparent bg-slate-800/70 text-[10px] uppercase tracking-wide text-slate-300">
                  {MODE_OPTIONS.find((option) => option.value === doc.mode)?.label ?? 'Mode'}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {format(new Date(doc.updatedAt), 'MMM d • HH:mm')}
                <span className="px-1">•</span>
                {doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'}
              </p>
            </button>
          ))}
          {documents.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 p-4 text-center text-xs text-slate-400">
              Create your first Prism Page to start writing with Gemini assistance.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderPageControls = () => {
    if (!currentDocument) {
      return null;
    }
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-[0_10px_40px_-30px_rgba(14,116,144,0.8)]">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {currentDocument.pages.map((_, index) => (
            <Button
              key={`prism-page-${index}`}
              variant={index === activePageIndex ? 'default' : 'ghost'}
              size="sm"
              className={
                index === activePageIndex
                  ? 'bg-indigo-500 text-white hover:bg-indigo-500/90'
                  : 'text-slate-200 hover:bg-indigo-500/10'
              }
              onClick={() => handleSelectPage(index)}
            >
              Page {index + 1}
            </Button>
          ))}
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Page {activePageIndex + 1} of {currentDocument.pages.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-700/70 bg-slate-900/40 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10"
            onClick={handleAddPage}
          >
            <Plus className="h-4 w-4" /> Add page
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-200 hover:bg-indigo-500/10 disabled:opacity-40"
            onClick={handleRemovePage}
            disabled={currentDocument.pages.length <= 1}
          >
            <Minus className="h-4 w-4" /> Remove page
          </Button>
        </div>
      </div>
    );
  };

  const renderToolbar = () => (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-[0_10px_40px_-30px_rgba(14,116,144,0.8)]">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('bold')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('italic')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('underline')}>
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={
            isHighlightMode
              ? 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
              : 'text-slate-200 hover:bg-indigo-500/10'
          }
          onClick={toggleHighlightMode}
          aria-pressed={isHighlightMode}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1 border-l border-slate-800/70 pl-3">
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('insertUnorderedList')}>
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('insertOrderedList')}>
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1 border-l border-slate-800/70 pl-3">
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('justifyLeft')}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('justifyCenter')}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-indigo-500/10" onClick={() => runCommand('justifyRight')}>
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 border-l border-slate-800/70 pl-3">
        {currentDocument && QUICK_INSERTS[currentDocument.mode].map((item) => (
          <Button
            key={item.label}
            variant="outline"
            size="sm"
            className="border-slate-700/70 bg-slate-900/50 text-xs text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10"
            onClick={() => insertSnippet(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2 border-l border-slate-800/70 pl-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-200 hover:bg-indigo-500/10"
          onClick={() => setEditorTheme(editorTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle editor theme"
        >
          {editorTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700/70 bg-slate-900/40 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10"
          onClick={() => recordVersion(currentDocument!.id, 'Manual snapshot')}
        >
          Save snapshot
        </Button>
        <Sheet open={isVersionSheetOpen} onOpenChange={setIsVersionSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-700/70 bg-slate-900/40 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10"
            >
              <History className="h-4 w-4" /> Versions
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[360px] border-l border-slate-800 bg-slate-950 text-slate-100">
            <SheetHeader>
              <SheetTitle>Version history</SheetTitle>
              <SheetDescription className="text-slate-400">Restore previous revisions or review AI-applied changes.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="mt-4 h-full pr-3">
              <div className="space-y-3">
                {currentDocument?.versions.map((version) => (
                  <div key={version.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-100">{format(new Date(version.createdAt), 'MMM d, HH:mm')}</p>
                      {version.aiGenerated && (
                        <Badge variant="outline" className="border-indigo-400/60 bg-indigo-500/10 text-[10px] uppercase text-indigo-200">
                          AI
                        </Badge>
                      )}
                    </div>
                    {version.summary && (
                      <p className="mt-2 text-xs text-slate-400">{version.summary}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={() => restoreVersion(currentDocument.id, version.id)}>
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-200 hover:bg-indigo-500/10"
                        onClick={() => navigator.clipboard.writeText(htmlToPlainText(version.content))}
                      >
                        Copy text
                      </Button>
                    </div>
                  </div>
                ))}
                {!currentDocument?.versions.length && (
                  <p className="text-sm text-slate-500">No saved versions yet.</p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  const renderSymbolPanel = () => {
    if (!currentDocument) {
      return null;
    }

    const symbolSet = MODE_SYMBOL_SETS[currentDocument.mode];
    if (!symbolSet?.length) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-4 text-sm text-slate-200 shadow-[0_10px_40px_-30px_rgba(14,116,144,0.8)]">
        <div className="flex flex-wrap gap-2">
          {symbolSet.map((symbol) => (
            <Button
              key={`${currentDocument.mode}-${symbol.label}`}
              variant="outline"
              size="sm"
              className="flex h-auto w-28 flex-col items-center gap-1 border-slate-700/70 bg-slate-900/40 text-slate-100 hover:border-indigo-400/60 hover:bg-indigo-500/10"
              onClick={() => insertSymbol(symbol.value)}
            >
              <span className="text-lg font-semibold">{symbol.value}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-300">{symbol.label}</span>
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Can't find what you are looking for? Try using Prism AI to input that symbol for you.
        </p>
      </div>
    );
  };

  const renderWorkspace = () => {
    if (!currentDocument) {
      return (
        <div className="flex flex-1 flex-col gap-8">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Start a new document</h3>
                <p className="text-sm text-slate-400">Select a blank page or choose a template to start faster.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-slate-700/70 bg-slate-900/40 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10"
                onClick={() => handleCreate({ mode: 'standard' })}
              >
                <FilePlus className="h-4 w-4" /> Blank page
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {TEMPLATE_PRESETS.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleCreate({ templateId: template.id })}
                  className="group relative flex flex-col rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-left transition hover:border-indigo-400/60 hover:bg-indigo-500/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                >
                  <div className="relative h-32 overflow-hidden rounded-xl bg-slate-950/70 shadow-inner">
                    <div className={"absolute inset-0 bg-gradient-to-br " + template.accent + " opacity-60 transition group-hover:opacity-80"} />
                    <div className="relative z-10 flex h-full flex-col justify-between p-3 text-[11px] uppercase tracking-widest text-white/75">
                      <span className="rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold">{template.title}</span>
                      <span className="text-[10px] font-medium">Gemini ready</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-semibold text-slate-100">{template.title}</p>
                    <p className="text-xs text-slate-400">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Recent documents</h3>
                <p className="text-sm text-slate-400">Your last edits are cached locally for instant resume.</p>
              </div>
              <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-200">Stored locally</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {recentDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => selectDocument(doc.id)}
                  className="group flex flex-col gap-2 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4 text-left transition hover:border-indigo-400/50 hover:bg-indigo-500/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-100">{doc.title}</p>
                    <Badge variant="outline" className="border-transparent bg-slate-800/70 text-[10px] uppercase tracking-wide text-slate-300">
                      {MODE_OPTIONS.find((option) => option.value === doc.mode)?.label ?? 'Mode'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {format(new Date(doc.updatedAt), 'MMM d • HH:mm')}
                    <span className="px-1">•</span>
                    {doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'}
                  </p>
                  <p className="text-xs text-slate-500">{getDocumentPreview(doc.pages?.[0] ?? doc.content)}</p>
                </button>
              ))}
              {!recentDocuments.length && (
                <div className="col-span-full rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
                  Create a document to see it listed here.
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Store up to {maxDocuments} documents locally. Export older work or duplicate templates anytime.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Input
                value={currentDocument.title}
                onChange={(event) => renameDocument(currentDocument.id, event.target.value)}
                className="max-w-xl border-none bg-transparent px-0 text-3xl font-semibold text-slate-100 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <p className="text-sm text-slate-400">Gemini 2.5 Pro assists revisions while every change stays on your device.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-200">Beta</Badge>
              <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-200">Exclusive access</Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-200">Mode</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-700/70 bg-slate-900/40 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10">
                    {MODE_OPTIONS.find((option) => option.value === currentDocument.mode)?.icon}
                    {MODE_OPTIONS.find((option) => option.value === currentDocument.mode)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 border-slate-800 bg-slate-900 text-slate-100">
                  {MODE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className="focus:bg-indigo-500/10 focus:text-indigo-200"
                      onClick={() => updateDocumentMode(currentDocument.id, option.value)}
                    >
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <div>
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs text-slate-400">{option.description}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-200 hover:bg-indigo-500/10" onClick={() => setIsAiDialogOpen(true)}>
              <Sparkles className="h-4 w-4" /> Ask Prism AI
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-200 hover:text-indigo-200">
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept=".docx,.pdf,.odt,.rtf,.txt,.md"
                className="hidden"
                onChange={handleImport}
                disabled={isImporting}
              />
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-slate-700/70 bg-slate-900/40 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleExport('docx')}>Export as .docx</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>Export as .pdf</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('odt')}>Export as .odt</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('rtf')}>Export as .rtf</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('txt')}>Export as .txt</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('md')}>Export as .md</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-red-400" onClick={() => handleDelete(currentDocument.id)}>
              <Trash className="h-4 w-4" /> Delete
            </Button>
        </div>
      </div>
      {renderPageControls()}
      {renderToolbar()}
      {renderSymbolPanel()}
      <div
        ref={editorRef}
        className={`flex-1 min-h-0 overflow-auto rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-base leading-7 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] transition [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-1 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 ${
          editorTheme === 'dark'
            ? 'text-slate-100 [&_*]:selection:bg-indigo-500/30'
              : 'bg-white text-slate-900 [&_*]:selection:bg-indigo-500/20'
          }`}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          autoCorrect="on"
          autoCapitalize="sentences"
          data-gramm="false"
          onInput={handleEditorInput}
          aria-label="Prism Pages editor"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden rounded-[inherit] bg-slate-950/60">
      {renderSidebar()}
      <div className="flex flex-1 min-h-0 flex-col gap-4 p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Loading your pages...
          </div>
        ) : (
          renderWorkspace()
        )}
      </div>

      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ask Prism AI to revise</DialogTitle>
            <DialogDescription>
              Describe how you would like Gemini 2.5 Pro to improve this document. You will be able to review the suggested
              version before applying it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={aiInstructions}
            onChange={(event) => setAiInstructions(event.target.value)}
            placeholder="Strengthen the introduction, add a summary paragraph, and highlight any equations."
            rows={5}
          />
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setIsAiDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestRevision} disabled={isRequestingRevision}>
              {isRequestingRevision ? 'Requesting...' : 'Generate proposal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingRevision} onOpenChange={(open) => !open && setPendingRevision(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review proposed changes</DialogTitle>
            <DialogDescription>
              Prism Pages generated a revised version. Compare the summary below and apply the update if it looks good.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
            <p className="font-medium">{pendingRevision?.summary}</p>
            {pendingRevision?.rationale && (
              <p className="mt-2 text-muted-foreground">{pendingRevision.rationale}</p>
            )}
          </div>
          <div
            className="max-h-[320px] overflow-auto rounded-lg border border-border/60 bg-background p-4"
            dangerouslySetInnerHTML={{ __html: pendingRevision?.updatedContent ?? '' }}
          />
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setPendingRevision(null)}>
              Dismiss
            </Button>
            <Button
              onClick={() => {
                if (currentDocument && pendingRevision) {
                  applyRevision(currentDocument.id, pendingRevision);
                  setPendingRevision(null);
                  toast.success('Applied AI revision');
                }
              }}
            >
              Apply changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrismPagesWorkspace;
