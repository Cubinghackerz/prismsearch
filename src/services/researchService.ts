import { format } from 'date-fns';

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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fgpdfkvabwemivzjeitx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const DEEP_SEARCH_URL = `${SUPABASE_URL}/functions/v1/deep-search-engine`;

const DEFAULT_MODE: ResearchMode = 'comprehensive';
const DEFAULT_MAX_SOURCES = 8;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

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

  const response = await fetch(DEEP_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SUPABASE_ANON_KEY
        ? {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          }
        : {}),
    },
    body: JSON.stringify({
      query: trimmedQuery,
      searchMode: mode,
      maxSources,
      fastMode,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to reach the research service. Please try again.');
  }

  const payload = await response.json();
  const summary = typeof payload?.summary === 'string' ? payload.summary.trim() : '';
  const sources = Array.isArray(payload?.sources) ? normalizeSources(payload.sources) : [];
  const sections = splitSummary(summary || `No structured summary was returned for "${trimmedQuery}". Try running the notebook again.`);
  const insights = buildInsights(sections, sources);
  const timeline = buildTimeline(sources);
  const followUps = buildFollowUps(insights, trimmedQuery);
  const generatedAt = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");

  const notebook: ResearchNotebook = {
    query: trimmedQuery,
    overview: summary || 'The research service returned minimal information for this topic. You may want to refresh or broaden the query.',
    insights,
    timeline,
    sources,
    followUps,
    generatedAt,
    metadata: {
      searchMode: mode,
      fastMode,
      totalSources: sources.length,
    },
  };

  researchCache.set(key, { timestamp: Date.now(), payload: notebook });
  return notebook;
};
