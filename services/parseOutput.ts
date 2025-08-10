// Lightweight parsers to extract code blocks, markdown tables, and chart-like data.
// No external dependencies; favor simple heuristics.

export type ParsedOutputs = {
  codeBlocks: { language?: string; code: string }[];
  tables: Array<{ headers: string[]; rows: string[][] }>;
  charts: Array<{ label: string; value: number }[]>;
  imageUris: string[];
  files: Array<{ name: string; uri: string }>;
};

const fenceRe = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
const mdTableHeaderSep = /^\s*\|?\s*(:?-{3,}:?\s*\|\s*)+(:?-{3,}:?)\s*\|?\s*$/;

export function parseOutputs(text: string): ParsedOutputs {
  const codeBlocks: { language?: string; code: string }[] = [];
  const tables: Array<{ headers: string[]; rows: string[][] }> = [];
  const charts: Array<{ label: string; value: number }[]> = [];
  const imageUris: string[] = [];
  const files: Array<{ name: string; uri: string }> = [];

  if (!text) return { codeBlocks, tables, charts, imageUris, files };

  // 1) Code fences
  for (const m of text.matchAll(fenceRe)) {
    const lang = (m[1] || '').trim() || undefined;
    const code = (m[2] || '').replace(/\n$/, '');
    codeBlocks.push({ language: lang, code });
  }

  // 2) Markdown tables (simple)
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length - 2; i++) {
    const hdrLine = lines[i];
    const sepLine = lines[i + 1];
    if (sepLine && mdTableHeaderSep.test(sepLine)) {
      const headers = splitRow(hdrLine);
      const rowLines: string[][] = [];
      let j = i + 2;
      while (j < lines.length && /\|/.test(lines[j])) {
        rowLines.push(splitRow(lines[j]));
        j++;
      }
      if (headers.length && rowLines.length) {
        tables.push({ headers, rows: rowLines });
        i = j - 1; // skip consumed lines
      }
    }
  }

  // 3) Chart data: either markdown list "Label: 10" or JSON array of {label,value}
  // Heuristic: look for a block starting with "Chart:" or fenced json with label/value
  const chartCandidates: Array<{ label: string; value: number }[]> = [];
  // Pattern: lines like "A: 12" or "A - 12"
  const chartBlock: { label: string; value: number }[] = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*[-*•]?\s*([\w .]+)\s*[:\-]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) {
      chartBlock.push({ label: m[1].trim(), value: Number(m[2]) });
    } else if (chartBlock.length) {
      chartCandidates.push([...chartBlock]);
      chartBlock.length = 0;
    }
  }
  if (chartBlock.length) chartCandidates.push([...chartBlock]);
  for (const c of chartCandidates) if (c.length >= 2) charts.push(c);

  // Try JSON array parse fallback
  try {
    const jsonMatches = text.match(/\[[\s\S]*\]/g);
    if (jsonMatches) {
      for (const jm of jsonMatches) {
        const val = JSON.parse(jm);
        if (Array.isArray(val) && val.every((o) => o && typeof o === 'object' && 'label' in o && 'value' in o)) {
          charts.push(val.map((o) => ({ label: String(o.label), value: Number(o.value) })));
        }
      }
    }
  } catch {}

  // 4) Image/file links: naive http(s) URL extraction
  const urlRe = /(https?:\/\/[^\s)\]]+)/g;
  const urlSet = new Set<string>();
  for (const m of text.matchAll(urlRe)) {
    const u = m[1];
    if (!u) continue;
    if (urlSet.has(u)) continue;
    urlSet.add(u);
    const lower = u.toLowerCase();
    if (lower.match(/\.(png|jpg|jpeg|gif|webp)(\?|#|$)/)) {
      imageUris.push(u);
    } else if (lower.match(/\.(txt|csv|json|pdf|zip|tar|gz|mp3|mp4|wav)(\?|#|$)/)) {
      const name = u.split('/').pop() || 'file';
      files.push({ name, uri: u });
    }
  }

  return { codeBlocks, tables, charts, imageUris, files };
}

function splitRow(line: string): string[] {
  // Remove leading/trailing pipes, split by | and trim cells
  const trimmed = line.replace(/^\s*\|?\s*/, '').replace(/\s*\|?\s*$/, '');
  return trimmed.split(/\s*\|\s*/).map((s) => s.trim());
}

