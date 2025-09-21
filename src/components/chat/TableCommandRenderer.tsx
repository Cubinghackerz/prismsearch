import React, { useEffect, useMemo, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import MathRenderer from '@/components/math-assistant/MathRenderer';

interface TableCommandRendererProps {
  content: string;
}

interface ParsedTable {
  headers: string[];
  rows: Record<string, string>[];
  markdown: string;
}

const parseMarkdownTable = (markdown: string): ParsedTable | null => {
  const tableMatch = markdown.match(/(^|\n)(\|.+\|)(\n\|[-:]+\|)([\s\S]*?)(\n\n|$)/);
  if (!tableMatch) {
    return null;
  }

  const tableBlock = tableMatch[0].trim();
  const [headerLine, , ...bodyLines] = tableBlock.split('\n').filter(Boolean);
  if (!headerLine || bodyLines.length === 0) {
    return null;
  }

  const headers = headerLine
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean);

  const dataLines = bodyLines.slice(1); // Skip alignment row
  const rows = dataLines
    .map((line) =>
      line
        .split('|')
        .slice(1, headers.length + 1)
        .map((cell) => cell.trim())
    )
    .filter((cells) => cells.length)
    .map((cells) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = cells[index] ?? '';
      });
      return record;
    });

  if (!rows.length) {
    return null;
  }

  return {
    headers,
    rows,
    markdown: tableBlock,
  };
};

const TableCommandRenderer: React.FC<TableCommandRendererProps> = ({ content }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseMarkdownTable(content), [content]);
  const supportingContent = parsed ? content.replace(parsed.markdown, '').trim() : content;

  useEffect(() => {
    if (!parsed || !tableRef.current) {
      return;
    }

    const tabulator = new Tabulator(tableRef.current, {
      data: parsed.rows,
      layout: 'fitColumns',
      columns: parsed.headers.map((header) => ({
        title: header,
        field: header,
        hozAlign: 'left',
        headerSort: true,
      })),
      pagination: parsed.rows.length > 12,
      paginationSize: 12,
      responsiveLayout: true,
      columnDefaults: {
        headerSortTristate: true,
      },
    });

    return () => {
      tabulator.destroy();
    };
  }, [parsed]);

  return (
    <div className="space-y-4">
      {supportingContent && (
        <MathRenderer content={supportingContent} className="text-foreground leading-relaxed" />
      )}

      {parsed && (
        <div className="rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
          <div className="border-b border-border/50 px-4 py-3 text-sm font-semibold text-foreground">Interactive table</div>
          <div ref={tableRef} className="tabulator-table"></div>
        </div>
      )}

      {!parsed && !supportingContent && (
        <MathRenderer content={content} className="text-foreground leading-relaxed" />
      )}
    </div>
  );
};

export default TableCommandRenderer;
