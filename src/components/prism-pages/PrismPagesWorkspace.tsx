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
  Wand2,
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
    recordVersion,
    restoreVersion,
    requestAiRevision,
    applyRevision,
    maxDocuments,
    isLoading,
  } = usePrismPages();

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [pendingRevision, setPendingRevision] = useState<PrismPagesRevisionProposal | null>(null);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [isVersionSheetOpen, setIsVersionSheetOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [contentDraft, setContentDraft] = useState('');

  const currentDocument = useMemo(
    () => documents.find((doc) => doc.id === selectedDocumentId) || null,
    [documents, selectedDocumentId]
  );

  useEffect(() => {
    if (currentDocument) {
      setContentDraft(currentDocument.content);
    } else {
      setContentDraft('');
    }
  }, [currentDocument?.id, currentDocument?.content]);

  useEffect(() => {
    if (!currentDocument) {
      return;
    }
    const debounce = window.setTimeout(() => {
      if (contentDraft !== currentDocument.content) {
        updateDocumentContent(currentDocument.id, contentDraft);
      }
    }, 500);

    return () => window.clearTimeout(debounce);
  }, [contentDraft, currentDocument, updateDocumentContent]);

  const runCommand = (command: string, value?: string) => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.focus();
    document.execCommand(command, false, value);
    const updated = editorRef.current.innerHTML;
    setContentDraft(updated);
  };

  const insertSnippet = (snippet: string) => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.focus();
    document.execCommand('insertHTML', false, snippet);
    const updated = editorRef.current.innerHTML;
    setContentDraft(updated);
  };

  const handleCreate = (mode: PrismPagesMode) => {
    const doc = createDocument(mode);
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
      toast.success(`Imported ${file.name}`);
    } catch (error) {
      console.error('Failed to import document', error);
      toast.error('Import failed');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const renderSidebar = () => (
    <div className="flex h-full flex-col gap-4 border-r border-border/60 bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your pages</h2>
          <p className="text-xs text-muted-foreground">{documents.length}/{maxDocuments} stored locally</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <FilePlus className="h-4 w-4" /> New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {MODE_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => handleCreate(option.value)}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <div>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => selectDocument(doc.id)}
              className={`rounded-lg border px-3 py-2 text-left transition hover:border-primary/60 hover:bg-primary/5 ${
                doc.id === currentDocument?.id ? 'border-primary bg-primary/10 text-primary-foreground' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{doc.title}</p>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {MODE_OPTIONS.find((option) => option.value === doc.mode)?.label ?? 'Mode'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(doc.updatedAt), 'MMM d, HH:mm')}
              </p>
            </button>
          ))}
          {documents.length === 0 && (
            <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-background/40 p-4 text-center text-xs text-muted-foreground">
              Create your first Prism Page to start writing with Gemini assistance.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderToolbar = () => (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => runCommand('bold')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => runCommand('italic')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => runCommand('underline')}>
          <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => runCommand('hiliteColor', '#fde047')}>
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1 border-l border-border/50 pl-2">
        <Button variant="ghost" size="icon" onClick={() => runCommand('insertUnorderedList')}>
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => runCommand('insertOrderedList')}>
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1 border-l border-border/50 pl-2">
        <Button variant="ghost" size="icon" onClick={() => runCommand('justifyLeft')}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => runCommand('justifyCenter')}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => runCommand('justifyRight')}>
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 border-l border-border/50 pl-2">
        {currentDocument && QUICK_INSERTS[currentDocument.mode].map((item) => (
          <Button key={item.label} variant="outline" size="sm" onClick={() => insertSnippet(item.value)}>
            {item.label}
          </Button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setEditorTheme((theme) => (theme === 'light' ? 'dark' : 'light'))}>
          {editorTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={() => recordVersion(currentDocument!.id, 'Manual snapshot')}>
          Save snapshot
        </Button>
        <Sheet open={isVersionSheetOpen} onOpenChange={setIsVersionSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" /> Versions
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[360px]">
            <SheetHeader>
              <SheetTitle>Version history</SheetTitle>
              <SheetDescription>Restore previous revisions or review AI-applied changes.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="mt-4 h-full pr-3">
              <div className="space-y-3">
                {currentDocument?.versions.map((version) => (
                  <div key={version.id} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{format(new Date(version.createdAt), 'MMM d, HH:mm')}</p>
                      {version.aiGenerated && (
                        <Badge variant="outline" className="text-[10px] uppercase text-primary">
                          AI
                        </Badge>
                      )}
                    </div>
                    {version.summary && (
                      <p className="mt-2 text-xs text-muted-foreground">{version.summary}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={() => restoreVersion(currentDocument.id, version.id)}>
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(htmlToPlainText(version.content))}
                      >
                        Copy text
                      </Button>
                    </div>
                  </div>
                ))}
                {!currentDocument?.versions.length && (
                  <p className="text-sm text-muted-foreground">No saved versions yet.</p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  const renderWorkspace = () => {
    if (!currentDocument) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
          <Wand2 className="mb-4 h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold">Create a Prism Page to begin</h3>
          <p className="mt-2 max-w-sm text-sm">
            Prism Pages stores everything locally and lets Gemini 2.5 Pro help you iterate with tracked revisions.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={currentDocument.title}
            onChange={(event) => renameDocument(currentDocument.id, event.target.value)}
            className="max-w-sm border-none bg-transparent px-0 text-2xl font-semibold"
          />
          <Badge variant="secondary" className="bg-primary/15 text-primary">
            Beta
          </Badge>
          <Badge variant="outline" className="border-primary/40 text-primary">
            Exclusive Access
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">Mode</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {MODE_OPTIONS.find((option) => option.value === currentDocument.mode)?.icon}
                  {MODE_OPTIONS.find((option) => option.value === currentDocument.mode)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {MODE_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => updateDocumentMode(currentDocument.id, option.value)}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsAiDialogOpen(true)}>
              <Sparkles className="h-4 w-4" /> Ask Prism AI
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
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
                <Button variant="outline" size="sm" className="gap-2">
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
            <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={() => handleDelete(currentDocument.id)}>
              <Trash className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
        {renderToolbar()}
        <div
          ref={editorRef}
          className={`flex-1 overflow-auto rounded-xl border border-border bg-background/80 p-6 text-base leading-7 shadow-inner transition ${
            editorTheme === 'dark'
              ? 'bg-slate-950 text-slate-100 [&_p]:text-slate-100'
              : 'bg-background text-foreground'
          }`}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => setContentDraft((event.target as HTMLDivElement).innerHTML)}
          dangerouslySetInnerHTML={{ __html: contentDraft }}
        />
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-[600px] rounded-2xl border border-border/80 bg-background shadow-xl">
      {renderSidebar()}
      <div className="flex flex-1 flex-col gap-4 p-6">
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
