import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export type ResearchMode = 'quick' | 'comprehensive' | 'quantum';

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  publishedAt: string;
  type: 'Reference' | 'News' | 'Education' | 'Government' | 'Web';
}

export interface ResearchInsight {
  id: string;
  heading: string;
  summary: string;
  supportingSources: string[];
}

export interface ResearchTimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  sourceId: string;
}

export interface ResearchFollowUp {
  id: string;
  question: string;
  rationale: string;
  relatedSources: string[];
}

export interface ResearchNotebook {
  query: string;
  overview: string;
  insights: ResearchInsight[];
  timeline: ResearchTimelineEvent[];
  sources: ResearchSource[];
  followUps: ResearchFollowUp[];
  generatedAt: string;
  metadata: {
    searchMode: ResearchMode;
    fastMode: boolean;
    totalSources: number;
  };
}

export interface ResearchNotebookOptions {
  mode?: ResearchMode;
  maxSources?: number;
  fastMode?: boolean;
  forceRefresh?: boolean;
}

interface CacheEntry {
  timestamp: number;
  payload: ResearchNotebook;
}

const DEFAULT_MODE: ResearchMode = 'comprehensive';
const DEFAULT_MAX_SOURCES = 8;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

const MODEL_ID = 'gemini-2.5-pro';

const researchCache = new Map<string, CacheEntry>();

const cacheKey = (query: string, options: ResearchNotebookOptions) => {
  const normalizedQuery = query.trim().toLowerCase();
  const parts = [
    normalizedQuery,
    options.mode ?? DEFAULT_MODE,
    options.maxSources ?? DEFAULT_MAX_SOURCES,
    options.fastMode ? 'fast' : 'full',
  ];

  return parts.join('|');
};

const isCacheValid = (entry: CacheEntry | undefined, forceRefresh?: boolean) => {
  if (!entry) {
    return false;
  }

  if (forceRefresh) {
    return false;
  }

  return Date.now() - entry.timestamp < CACHE_TTL_MS;
};

const inferSourceType = (url: string): ResearchSource['type'] => {
  if (!url) {
    return 'Web';
  }
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('wikipedia') || hostname.endsWith('.edu')) {
      return 'Education';
    }
    if (hostname.includes('gov')) {
      return 'Government';
    }
    if (hostname.includes('news') || hostname.includes('nytimes') || hostname.includes('wsj') || hostname.includes('bbc')) {
      return 'News';
    }
    if (hostname.includes('khanacademy') || hostname.includes('coursera') || hostname.includes('edx')) {
      return 'Education';
    }
    if (hostname.includes('britannica')) {
      return 'Reference';
    }
    return 'Web';
  } catch (error) {
    console.warn('Unable to determine source type for url', url, error);
    return 'Web';
  }
};

const normalizeSources = (rawSources: unknown[]): ResearchSource[] => {
  const baseTime = Date.now();
  const step = 1000 * 60 * 45; // 45 minutes between items for visualization

  return rawSources
    .map((source, index) => {
      const record = (typeof source === 'object' && source !== null
        ? (source as Record<string, unknown>)
        : {}) as Record<string, unknown>;

      const rawTitle = typeof record.title === 'string' ? (record.title as string) : '';
      const rawUrl = typeof record.url === 'string' ? (record.url as string) : '';
      const rawSnippet = typeof record.snippet === 'string' ? (record.snippet as string) : '';

      return {
        id: `source-${index}`,
        title: rawTitle.trim() || 'Untitled source',
        url: rawUrl,
        snippet: rawSnippet.trim() || 'No summary available for this source.',
        publishedAt: format(new Date(baseTime - (rawSources.length - index - 1) * step), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        type: inferSourceType(rawUrl),
      } satisfies ResearchSource;
    })
    .filter((source) => Boolean(source.url));
};

const splitSummary = (summary: string): string[] => {
  return summary
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
};

const extractHeading = (text: string, index: number): string => {
  const sentence = text.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (sentence && sentence.length <= 90) {
    return sentence.replace(/[:.;]+$/g, '');
  }

  const fallback = text.replace(/[#*]/g, '').split(/\n/)[0]?.trim();
  if (fallback && fallback.length <= 90) {
    return fallback;
  }

  return `Key insight ${index + 1}`;
};

const buildInsights = (sections: string[], sources: ResearchSource[]): ResearchInsight[] => {
  if (sections.length === 0) {
    return [];
  }

  return sections.slice(0, 4).map((section, index) => {
    const supporting = sources.slice(index * 2, index * 2 + 2).map((source) => source.id);
    return {
      id: `insight-${index}`,
      heading: extractHeading(section, index),
      summary: section,
      supportingSources: supporting,
    } satisfies ResearchInsight;
  });
};

const buildTimeline = (sources: ResearchSource[]): ResearchTimelineEvent[] => {
  if (sources.length === 0) {
    const fallbackTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
    return [
      {
        id: 'event-fallback',
        title: 'Notebook initialized',
        timestamp: fallbackTime,
        description: 'Start by entering a topic to generate a research plan and curated sources.',
        sourceId: 'source-fallback',
      },
    ];
  }

  return sources.map((source) => ({
    id: `event-${source.id}`,
    title: source.title,
    timestamp: source.publishedAt,
    description: source.snippet,
    sourceId: source.id,
  }));
};

const buildFollowUps = (insights: ResearchInsight[], query: string): ResearchFollowUp[] => {
  const baseFollowUps = insights.slice(0, 3).map((insight, index) => {
    const focus = insight.heading.replace(/key insight \d+/i, '').trim() || query;
    return {
      id: `follow-${index}`,
      question: `What evidence can validate or challenge "${focus}"?`,
      rationale: `Derived from insight ${index + 1}, collect additional data or opposing viewpoints to strengthen this finding.`,
      relatedSources: insight.supportingSources,
    } satisfies ResearchFollowUp;
  });

  if (baseFollowUps.length >= 3) {
    return baseFollowUps;
  }

  const supplemental: ResearchFollowUp[] = [
    {
      id: 'follow-scope',
      question: `Identify emerging trends surrounding ${query}.`,
      rationale: 'Scan reputable sources for new developments so the notebook stays fresh.',
      relatedSources: [],
    },
    {
      id: 'follow-actions',
      question: `Translate the research on ${query} into actionable next steps.`,
      rationale: 'Summarize clear recommendations or experiments based on the compiled insights.',
      relatedSources: [],
    },
  ];

  return [...baseFollowUps, ...supplemental].slice(0, 3);
};

interface NotebookModelResponse {
  overview?: string;
  summary?: string;
  insights?: unknown[];
  keyInsights?: unknown[];
  sections?: unknown;
  keyTakeaways?: unknown;
  timeline?: unknown[];
  keyMoments?: unknown[];
  sources?: unknown[];
  references?: unknown[];
  followUps?: unknown[];
  nextSteps?: unknown[];
  metadata?: Partial<ResearchNotebook['metadata']> & { context?: string };
  generatedAt?: string;
}

const extractJsonObject = (text: string): NotebookModelResponse | null => {
  if (!text) {
    return null;
  }

  const trimmed = text.trim();

  const tryParse = (value: string) => {
    try {
      return JSON.parse(value) as NotebookModelResponse;
    } catch {
      return null;
    }
  };

  const direct = tryParse(trimmed);
  if (direct) {
    return direct;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    return tryParse(match[0]);
  }

  return null;
};

const ensureIsoString = (value: unknown, fallback: Date): string => {
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return fallback.toISOString();
};

const parseModelSources = (rawSources: unknown[] | undefined): ResearchSource[] => {
  if (!rawSources || rawSources.length === 0) {
    return [];
  }

  const baseTime = Date.now();
  const step = 1000 * 60 * 45;

  const typedSources = rawSources
    .map((entry, index) => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const record = entry as Partial<ResearchSource> &
        Partial<{ publishedAt: string; type: ResearchSource['type']; url: string; snippet: string; title: string; id: string }> &
        Record<string, unknown>;

      const fallbackDate = new Date(baseTime - (rawSources.length - index - 1) * step);
      const url = typeof record.url === 'string' ? record.url : String(record['link'] ?? record['sourceUrl'] ?? '');

      if (!url) {
        return null;
      }

      const id = typeof record.id === 'string' && record.id.trim().length > 0 ? record.id.trim() : `source-${index}`;
      const titleCandidate = record.title ?? record['name'] ?? record['headline'];
      const snippetCandidate = record.snippet ?? record['summary'] ?? record['notes'];

      const title = typeof titleCandidate === 'string' && titleCandidate.trim().length > 0
        ? titleCandidate.trim()
        : 'Untitled source';

      const snippet = typeof snippetCandidate === 'string' && snippetCandidate.trim().length > 0
        ? snippetCandidate.trim()
        : 'No summary available for this source.';

      const publishedAt = ensureIsoString(record.publishedAt, fallbackDate);

      const typeCandidate = record.type ?? record['category'];
      const allowedTypes: ResearchSource['type'][] = ['Reference', 'News', 'Education', 'Government', 'Web'];
      const type =
        typeof typeCandidate === 'string' && allowedTypes.includes(typeCandidate as ResearchSource['type'])
          ? (typeCandidate as ResearchSource['type'])
          : inferSourceType(url);

      return {
        id,
        title,
        url,
        snippet,
        publishedAt,
        type,
      } satisfies ResearchSource;
    })
    .filter((value): value is ResearchSource => Boolean(value));

  return typedSources;
};

const parseModelInsights = (rawInsights: unknown[] | undefined, sources: ResearchSource[], query: string): ResearchInsight[] => {
  if (!rawInsights || rawInsights.length === 0) {
    return [];
  }

  const sourceIds = new Set(sources.map((source) => source.id));

  return rawInsights
    .map((entry, index) => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const record = entry as Partial<ResearchInsight> & Record<string, unknown>;
      const headingCandidate = record.heading ?? record['title'] ?? record['keyPoint'];
      const summaryCandidate = record.summary ?? record['explanation'] ?? record['analysis'];
      const supportsCandidate = record.supportingSources ?? record['sources'] ?? record['citations'];

      const heading =
        typeof headingCandidate === 'string' && headingCandidate.trim().length > 0
          ? headingCandidate.trim()
          : extractHeading(typeof summaryCandidate === 'string' ? summaryCandidate : query, index);

      const summary =
        typeof summaryCandidate === 'string' && summaryCandidate.trim().length > 0
          ? summaryCandidate.trim()
          : `Insight ${index + 1} explores an important aspect of ${query}.`;

      const supportingSources = Array.isArray(supportsCandidate)
        ? supportsCandidate
            .map((value) => (typeof value === 'string' ? value.trim() : null))
            .filter((value): value is string => Boolean(value && sourceIds.has(value)))
        : [];

      return {
        id: typeof record.id === 'string' && record.id.trim().length > 0 ? record.id : `insight-${index}`,
        heading,
        summary,
        supportingSources,
      } satisfies ResearchInsight;
    })
    .filter((value): value is ResearchInsight => Boolean(value));
};

const parseModelTimeline = (
  rawTimeline: unknown[] | undefined,
  sources: ResearchSource[],
  query: string,
): ResearchTimelineEvent[] => {
  if (!rawTimeline || rawTimeline.length === 0) {
    return [];
  }

  const sourceIds = new Set(sources.map((source) => source.id));

  return rawTimeline
    .map((entry, index) => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const record = entry as Partial<ResearchTimelineEvent> & Record<string, unknown>;
      const fallbackDate = new Date(Date.now() - (rawTimeline.length - index - 1) * 1000 * 60 * 60);

      const titleCandidate = record.title ?? record['heading'] ?? record['label'];
      const descriptionCandidate = record.description ?? record['details'] ?? record['summary'];
      const sourceCandidate = record.sourceId ?? record['source'] ?? record['sourceReference'];

      const sourceId =
        typeof sourceCandidate === 'string' && sourceCandidate.trim().length > 0 && sourceIds.has(sourceCandidate.trim())
          ? sourceCandidate.trim()
          : sources[index]?.id ?? 'source-fallback';

      const timestamp = ensureIsoString(record.timestamp, fallbackDate);

      const title =
        typeof titleCandidate === 'string' && titleCandidate.trim().length > 0
          ? titleCandidate.trim()
          : `Key development ${index + 1}`;

      const description =
        typeof descriptionCandidate === 'string' && descriptionCandidate.trim().length > 0
          ? descriptionCandidate.trim()
          : `Notable update related to ${query}.`;

      return {
        id: typeof record.id === 'string' && record.id.trim().length > 0 ? record.id : `event-${index}`,
        title,
        timestamp,
        description,
        sourceId,
      } satisfies ResearchTimelineEvent;
    })
    .filter((value): value is ResearchTimelineEvent => Boolean(value));
};

const parseModelFollowUps = (
  rawFollowUps: unknown[] | undefined,
  sources: ResearchSource[],
  query: string,
): ResearchFollowUp[] => {
  if (!rawFollowUps || rawFollowUps.length === 0) {
    return [];
  }

  const sourceIds = new Set(sources.map((source) => source.id));

  return rawFollowUps
    .map((entry, index) => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const record = entry as Partial<ResearchFollowUp> & Record<string, unknown>;

      const questionCandidate = record.question ?? record['prompt'] ?? record['task'];
      const rationaleCandidate = record.rationale ?? record['reason'] ?? record['motivation'];
      const relatedCandidate = record.relatedSources ?? record['sources'] ?? record['citations'];

      const question =
        typeof questionCandidate === 'string' && questionCandidate.trim().length > 0
          ? questionCandidate.trim()
          : `Investigate further angles on ${query}.`;

      const rationale =
        typeof rationaleCandidate === 'string' && rationaleCandidate.trim().length > 0
          ? rationaleCandidate.trim()
          : 'Explore this follow-up to deepen your understanding.';

      const relatedSources = Array.isArray(relatedCandidate)
        ? relatedCandidate
            .map((value) => (typeof value === 'string' ? value.trim() : null))
            .filter((value): value is string => Boolean(value && sourceIds.has(value)))
        : [];

      return {
        id: typeof record.id === 'string' && record.id.trim().length > 0 ? record.id : `follow-${index}`,
        question,
        rationale,
        relatedSources,
      } satisfies ResearchFollowUp;
    })
    .filter((value): value is ResearchFollowUp => Boolean(value));
};

const buildNotebookPrompt = (
  query: string,
  mode: ResearchMode,
  maxSources: number,
  fastMode: boolean,
): string => {
  return `You are Prism Research Notebook using Gemini 2.5 Pro. For the topic "${query}", compile a structured research dossier.

Return ONLY valid JSON (no markdown) with the following schema:
{
  "overview": "Concise synthesis (2-3 paragraphs) summarizing the most important findings.",
  "insights": [
    {
      "id": "insight-1",
      "heading": "Short descriptive title",
      "summary": "3-5 sentence explanation with evidence",
      "supportingSources": ["source-1", "source-3"]
    }
  ],
  "timeline": [
    {
      "id": "event-1",
      "title": "Event title",
      "timestamp": "ISO 8601 date",
      "description": "1-2 sentence description",
      "sourceId": "source-1"
    }
  ],
  "sources": [
    {
      "id": "source-1",
      "title": "Source title",
      "url": "https://...",
      "snippet": "Short excerpt or summary",
      "publishedAt": "ISO 8601 date",
      "type": "Reference" | "News" | "Education" | "Government" | "Web"
    }
  ],
  "followUps": [
    {
      "id": "follow-1",
      "question": "Follow-up research question",
      "rationale": "Why this matters",
      "relatedSources": ["source-2"]
    }
  ],
  "metadata": {
    "searchMode": "${mode}",
    "fastMode": ${fastMode},
    "totalSources": number,
    "context": "Explain the overall framing and whether primary information was limited"
  },
  "generatedAt": "ISO 8601 timestamp"
}

Provide at least ${Math.min(maxSources, 6)} detailed sources with credible URLs. Reuse source IDs consistently across insights, timeline, and follow-ups. Format every string cleanly for presentation.`;
};

export const fetchResearchNotebook = async (
  query: string,
  options: ResearchNotebookOptions = {},
): Promise<ResearchNotebook> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error('Please provide a topic or question to research.');
  }

  const key = cacheKey(trimmedQuery, options);
  const cached = researchCache.get(key);

  if (isCacheValid(cached, options.forceRefresh)) {
    return cached!.payload;
  }

  const mode = options.mode ?? DEFAULT_MODE;
  const maxSources = options.maxSources ?? DEFAULT_MAX_SOURCES;
  const fastMode = Boolean(options.fastMode);

  const prompt = buildNotebookPrompt(trimmedQuery, mode, maxSources, fastMode);
  const chatId = `research-notebook-${trimmedQuery.replace(/[^a-z0-9]+/gi, '-').slice(0, 48)}`.toLowerCase();

  const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
    body: {
      query: prompt,
      model: MODEL_ID,
      chatId,
      chatHistory: [],
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to reach the research service. Please try again.');
  }

  const responseText = typeof data?.response === 'string' ? data.response.trim() : '';
  const parsed = extractJsonObject(responseText);
  const metadata = parsed?.metadata;

  const rawSources = (parsed?.sources as unknown[]) ?? (parsed?.references as unknown[]) ?? [];
  let sources = parseModelSources(rawSources);
  if (!sources.length && Array.isArray(rawSources)) {
    sources = normalizeSources(rawSources);
  }

  const overviewText = (parsed?.overview ?? parsed?.summary ?? '') as string;
  const overview = overviewText && typeof overviewText === 'string' ? overviewText.trim() : '';

  const sectionCandidates = Array.isArray(parsed?.sections)
    ? (parsed?.sections as unknown[])
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0)
    : Array.isArray(parsed?.keyTakeaways)
    ? (parsed?.keyTakeaways as unknown[])
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0)
    : overview
    ? splitSummary(overview)
    : [];

  let insights = parseModelInsights((parsed?.insights as unknown[]) ?? (parsed?.keyInsights as unknown[]), sources, trimmedQuery);
  if (!insights.length && sectionCandidates.length > 0) {
    insights = buildInsights(sectionCandidates, sources);
  }

  let timeline = parseModelTimeline((parsed?.timeline as unknown[]) ?? (parsed?.keyMoments as unknown[]), sources, trimmedQuery);
  if (!timeline.length) {
    timeline = buildTimeline(sources);
  }

  let followUps = parseModelFollowUps((parsed?.followUps as unknown[]) ?? (parsed?.nextSteps as unknown[]), sources, trimmedQuery);
  if (!followUps.length) {
    followUps = buildFollowUps(insights, trimmedQuery);
  }

  const generatedAt = ensureIsoString(parsed?.generatedAt, new Date());

  const contextNote = typeof metadata?.context === 'string' ? metadata.context.trim() : '';
  const mergedOverview = overview
    ? contextNote
      ? `${overview}\n\nContext: ${contextNote}`
      : overview
    : 'Gemini 2.5 Pro could not generate a full overview for this topic. Try running the notebook again or refining the prompt.';

  const totalSources =
    typeof metadata?.totalSources === 'number' && !Number.isNaN(metadata.totalSources)
      ? metadata.totalSources
      : sources.length;

  const notebook: ResearchNotebook = {
    query: trimmedQuery,
    overview: mergedOverview,
    insights,
    timeline,
    sources,
    followUps,
    generatedAt,
    metadata: {
      searchMode: mode,
      fastMode,
      totalSources,
    },
  };

  researchCache.set(key, { timestamp: Date.now(), payload: notebook });
  return notebook;
};
