import { NextRequest, NextResponse } from "next/server";

const HEADERS = { "User-Agent": "Adumate/1.0 (https://adumate.in)" };

export interface PlaceInfo {
  name: string;
  description?: string;
  wikipedia?: string;
  wikipediaUrl?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
  phone?: string;
  address?: string;
  opening_hours?: string;
  image?: string;
}

// ── 1. OSM Overpass — get social tags by coords ────────────────────────────
async function fetchOsmSocial(lat: number, lon: number, name: string): Promise<Partial<PlaceInfo>> {
  try {
    const query = `
      [out:json][timeout:8];
      (
        node["name"~"${name.replace(/"/g, "")}", i](around:80,${lat},${lon});
        way["name"~"${name.replace(/"/g, "")}", i](around:80,${lat},${lon});
      );
      out tags;
    `;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    const el = data.elements?.[0]?.tags || {};

    return {
      instagram: el["contact:instagram"] || el["social:instagram"] || undefined,
      facebook: el["contact:facebook"] || el["social:facebook"] || undefined,
      youtube: el["contact:youtube"] || undefined,
      twitter: el["contact:twitter"] || el["social:twitter"] || undefined,
      website: el["contact:website"] || el["website"] || undefined,
      phone: el["contact:phone"] || el["phone"] || undefined,
      opening_hours: el["opening_hours"] || undefined,
    };
  } catch {
    return {};
  }
}

// ── 2. Wikipedia summary ───────────────────────────────────────────────────
async function fetchWikipedia(name: string, lat: number, lon: number): Promise<Partial<PlaceInfo>> {
  try {
    // Try geo-search first (places near these coords)
    const geoRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      { headers: HEADERS, signal: AbortSignal.timeout(5000) }
    );
    if (geoRes.ok) {
      const d = await geoRes.json();
      if (d.extract) return {
        wikipedia: d.extract.slice(0, 400),
        wikipediaUrl: d.content_urls?.desktop?.page,
        image: d.thumbnail?.source,
      };
    }
    // Fallback: geo search
    const nearby = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(name)}`,
      { headers: HEADERS, signal: AbortSignal.timeout(5000) }
    );
    if (nearby.ok) {
      const d = await nearby.json();
      const page = d.pages?.[0];
      if (page?.extract) return {
        wikipedia: page.extract.slice(0, 400),
        wikipediaUrl: page.content_urls?.desktop?.page,
        image: page.thumbnail?.source,
      };
    }
  } catch { /* ignore */ }
  return {};
}

// ── 3. DuckDuckGo social search ────────────────────────────────────────────
async function fetchDdgSocial(name: string, city: string): Promise<Partial<PlaceInfo>> {
  try {
    const result: Partial<PlaceInfo> = {};

    // Search for Instagram
    const igRes = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(name + " " + city + " instagram")}&format=json&no_html=1`,
      { headers: HEADERS, signal: AbortSignal.timeout(5000) }
    );
    const igData = await igRes.json();

    // Look for instagram.com links in RelatedTopics
    const allTopics = [...(igData.RelatedTopics || []), ...(igData.Results || [])];
    for (const t of allTopics) {
      const url: string = t.FirstURL || t.url || "";
      if (url.includes("instagram.com/") && !result.instagram) {
        const match = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
        if (match) result.instagram = `https://instagram.com/${match[1]}`;
      }
      if (url.includes("facebook.com/") && !result.facebook) {
        const match = url.match(/facebook\.com\/([a-zA-Z0-9_.]+)/);
        if (match && !["sharer", "share", "login", "help"].includes(match[1]))
          result.facebook = `https://facebook.com/${match[1]}`;
      }
      if (url.includes("youtube.com/") && !result.youtube) {
        const match = url.match(/youtube\.com\/(channel\/|c\/|@)?([a-zA-Z0-9_.-]+)/);
        if (match) result.youtube = url;
      }
    }

    return result;
  } catch {
    return {};
  }
}

// ── 4. Extract social links from website via Jina AI ──────────────────────
async function fetchWebsiteSocials(website: string): Promise<Partial<PlaceInfo>> {
  if (!website) return {};
  try {
    const safeUrl = website.startsWith("http") ? website : `https://${website}`;
    const res = await fetch(`https://r.jina.ai/${safeUrl}`, {
      headers: { ...HEADERS, Accept: "text/plain" },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    const result: Partial<PlaceInfo> = {};

    const igMatch = text.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    if (igMatch && !["p", "explore", "reels"].includes(igMatch[1]))
      result.instagram = `https://instagram.com/${igMatch[1]}`;

    const fbMatch = text.match(/facebook\.com\/([a-zA-Z0-9_.]+)/);
    if (fbMatch && !["sharer", "share", "login", "help", "tr"].includes(fbMatch[1]))
      result.facebook = `https://facebook.com/${fbMatch[1]}`;

    const ytMatch = text.match(/youtube\.com\/(channel\/|c\/|@[a-zA-Z0-9_.-]+|[a-zA-Z0-9_.-]+)/);
    if (ytMatch) result.youtube = `https://youtube.com/${ytMatch[1]}`;

    const twtMatch = text.match(/twitter\.com\/([a-zA-Z0-9_]+)/);
    if (twtMatch && !["intent", "share", "home"].includes(twtMatch[1]))
      result.twitter = `https://twitter.com/${twtMatch[1]}`;

    return result;
  } catch {
    return {};
  }
}

// ── MAIN handler ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");
  const website = searchParams.get("website") || "";
  const city = searchParams.get("city") || "India";

  if (!name || isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "name, lat, lon required" }, { status: 400 });
  }

  // Run all sources in parallel
  const [osmData, wikiData, ddgData, webData] = await Promise.allSettled([
    fetchOsmSocial(lat, lon, name),
    fetchWikipedia(name, lat, lon),
    fetchDdgSocial(name, city),
    website ? fetchWebsiteSocials(website) : Promise.resolve({}),
  ]);

  const osm = osmData.status === "fulfilled" ? osmData.value : {};
  const wiki = wikiData.status === "fulfilled" ? wikiData.value : {};
  const ddg = ddgData.status === "fulfilled" ? ddgData.value : {};
  const web = webData.status === "fulfilled" ? webData.value : {};

  // Merge — OSM > Website > DDG (priority order)
  const merged: PlaceInfo = {
    name,
    instagram: osm.instagram || web.instagram || ddg.instagram,
    facebook: osm.facebook || web.facebook || ddg.facebook,
    youtube: osm.youtube || web.youtube || ddg.youtube,
    twitter: osm.twitter || web.twitter || ddg.twitter,
    website: osm.website || website || undefined,
    phone: osm.phone,
    opening_hours: osm.opening_hours,
    wikipedia: wiki.wikipedia,
    wikipediaUrl: wiki.wikipediaUrl,
    image: wiki.image,
  };

  return NextResponse.json(merged, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
