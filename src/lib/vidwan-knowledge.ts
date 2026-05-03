// lib/vidwan-knowledge.ts
// Vidwan's Web Intelligence Layer — Free APIs, No Python needed

export interface KnowledgeContext {
  wikipedia?: string;
  news?: string;
  github?: string;
  sources: string[];
}

const HEADERS = { "User-Agent": "Adumate-Vidwan/1.0 (https://adumate.in)" };

// ── 1. WIKIPEDIA ──────────────────────────────────────────────────────────
async function fetchWikipedia(query: string): Promise<string | null> {
  try {
    // Search for the best matching article
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, "_"))}`;
    const res = await fetch(searchUrl, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      // fallback: use opensearch
      const search = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`,
        { headers: HEADERS, signal: AbortSignal.timeout(5000) }
      );
      const [, titles] = await search.json();
      if (!titles?.[0]) return null;
      const res2 = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titles[0])}`,
        { headers: HEADERS, signal: AbortSignal.timeout(5000) }
      );
      if (!res2.ok) return null;
      const d = await res2.json();
      return d.extract ? `[Wikipedia: ${d.title}]\n${d.extract}` : null;
    }
    const data = await res.json();
    return data.extract ? `[Wikipedia: ${data.title}]\n${data.extract}` : null;
  } catch {
    return null;
  }
}

// ── 2. DUCKDUCKGO INSTANT ANSWER ──────────────────────────────────────────
async function fetchDDG(query: string): Promise<string | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    const parts: string[] = [];
    if (data.AbstractText) parts.push(`[DuckDuckGo]\n${data.AbstractText}`);
    if (data.RelatedTopics?.length) {
      const topics = data.RelatedTopics
        .slice(0, 3)
        .map((t: { Text?: string }) => t.Text)
        .filter(Boolean)
        .join("\n• ");
      if (topics) parts.push(`Related:\n• ${topics}`);
    }
    return parts.length ? parts.join("\n\n") : null;
  } catch {
    return null;
  }
}

// ── 3. RSS NEWS FEEDS (Tech + India + General) ────────────────────────────
const RSS_FEEDS = [
  { name: "BBC India", url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
  { name: "Hacker News", url: "https://hnrss.org/frontpage?count=10" },
  { name: "Science Daily", url: "https://www.sciencedaily.com/rss/top/science.xml" },
];

async function fetchRSSNews(query: string): Promise<string | null> {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  // Pick relevant feed based on topic
  let feed = RSS_FEEDS[0]; // default BBC India
  if (/tech|ai|software|code|python|startup|app/i.test(query)) feed = RSS_FEEDS[1]; // TechCrunch
  if (/science|research|study|biology|physics|chemistry/i.test(query)) feed = RSS_FEEDS[4]; // Science Daily
  if (/hacker|developer|programming|github|open.?source/i.test(query)) feed = RSS_FEEDS[3]; // HN

  try {
    // Use rss2json free API to convert RSS to JSON
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=10`,
      { signal: AbortSignal.timeout(6000) }
    );
    const data = await res.json();
    if (data.status !== "ok") return null;

    // Filter relevant items
    const relevant = data.items
      .filter((item: { title: string; description: string }) =>
        queryWords.some(w => item.title.toLowerCase().includes(w) || item.description?.toLowerCase().includes(w))
      )
      .slice(0, 3);

    if (!relevant.length) {
      // Return latest 3 if none match
      const latest = data.items.slice(0, 3);
      const headlines = latest.map((i: { title: string; link: string }) => `• ${i.title} → ${i.link}`).join("\n");
      return `[${feed.name} — Latest Headlines]\n${headlines}`;
    }

    const articles = relevant
      .map((i: { title: string; link: string; description: string }) =>
        `• ${i.title}\n  ${i.description?.replace(/<[^>]+>/g, "").slice(0, 150)}...\n  ${i.link}`
      )
      .join("\n\n");
    return `[${feed.name} — Relevant Articles]\n${articles}`;
  } catch {
    return null;
  }
}

// ── 4. GITHUB TRENDING ────────────────────────────────────────────────────
async function fetchGitHub(query: string): Promise<string | null> {
  try {
    // Search GitHub repos related to query
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
      {
        headers: { ...HEADERS, Accept: "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items?.length) return null;

    const repos = data.items
      .slice(0, 4)
      .map((r: { full_name: string; description: string; stargazers_count: number; html_url: string }) =>
        `• ⭐ ${r.stargazers_count.toLocaleString()} — **${r.full_name}**\n  ${r.description || "No description"}\n  ${r.html_url}`
      )
      .join("\n\n");

    return `[GitHub — Top Repos for "${query}"]\n${repos}`;
  } catch {
    return null;
  }
}

// ── 5. JINA AI — Read any URL ─────────────────────────────────────────────
export async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { ...HEADERS, Accept: "text/plain" },
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    return text.slice(0, 3000); // First 3000 chars
  } catch {
    return null;
  }
}

// ── MAIN: Gather All Knowledge ────────────────────────────────────────────
export async function gatherKnowledge(query: string, type: "search" | "tech" | "news" | "general" = "general"): Promise<KnowledgeContext> {
  const sources: string[] = [];
  const context: KnowledgeContext = { sources };

  // Run all fetches in parallel for speed
  const [wiki, ddg, news, github] = await Promise.allSettled([
    fetchWikipedia(query),
    fetchDDG(query),
    fetchRSSNews(query),
    (type === "tech" || /code|github|software|programming|ai model|framework/i.test(query))
      ? fetchGitHub(query)
      : Promise.resolve(null),
  ]);

  if (wiki.status === "fulfilled" && wiki.value) {
    context.wikipedia = wiki.value;
    sources.push("Wikipedia");
  }
  if (ddg.status === "fulfilled" && ddg.value) {
    // Merge with wikipedia or use as supplement
    context.wikipedia = (context.wikipedia || "") + "\n\n" + ddg.value;
    sources.push("DuckDuckGo");
  }
  if (news.status === "fulfilled" && news.value) {
    context.news = news.value;
    sources.push("News RSS");
  }
  if (github.status === "fulfilled" && github.value) {
    context.github = github.value;
    sources.push("GitHub");
  }

  return context;
}

// Format context for injection into AI prompt
export function formatContextForAI(ctx: KnowledgeContext): string {
  const parts: string[] = [];
  if (ctx.wikipedia) parts.push(ctx.wikipedia);
  if (ctx.news) parts.push(ctx.news);
  if (ctx.github) parts.push(ctx.github);

  if (!parts.length) return "";
  return `\n\n---\n📚 REAL-TIME KNOWLEDGE BASE (Use this to answer accurately):\n${parts.join("\n\n---\n")}\n---\n`;
}
