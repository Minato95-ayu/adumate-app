import { NextRequest, NextResponse } from "next/server";

// Sample route coords [lng, lat] pairs → we build a bounding box and query OSM
// Also supports sampling points along the route for corridor search

const ALLOWED_CATEGORIES = new Set(["library", "hostel", "mess", "tutor", "job", "all"]);

const OSM_AMENITY_MAP: Record<string, string[]> = {
  library: ["library"],
  hostel: ["hostel", "guest_house"],
  mess: ["restaurant", "fast_food", "cafe"],
  tutor: ["school", "college", "university"],
  job: ["coworking"],
};

const OSM_NAME_PATTERNS: Record<string, string> = {
  library: "library|reading room|study hall",
  hostel: "hostel|pg|paying guest|boys hostel|girls hostel|dormitory",
  mess: "mess|tiffin|canteen|dhaba|bhojanalaya",
  tutor: "coaching|tuition|academy|tutorial|institute|classes",
  job: "company|solutions|technologies|startup|pvt ltd|coworking",
  all: "library|hostel|pg|mess|tiffin|coaching|tuition|academy|school|institute|canteen",
};

function buildBBox(coords: [number, number][]): { south: number; west: number; north: number; east: number } | null {
  if (!coords || coords.length < 2) return null;
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const [lng, lat] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  // Add a small buffer (≈ 300m)
  const buf = 0.003;
  return { south: minLat - buf, west: minLng - buf, north: maxLat + buf, east: maxLng + buf };
}

// Sample N evenly-spaced points from the route coordinates
function samplePoints(coords: [number, number][], n = 8): [number, number][] {
  if (coords.length <= n) return coords;
  const step = (coords.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => coords[Math.round(i * step)]);
}

// Haversine in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find closest point on route to a given lat/lng
function distanceToRoute(lat: number, lng: number, routeCoords: [number, number][]): number {
  let minDist = Infinity;
  for (const [rLng, rLat] of routeCoords) {
    const d = haversineKm(lat, lng, rLat, rLng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// Find roughly where along the route this place appears (0..1 fraction)
function routeProgress(lat: number, lng: number, routeCoords: [number, number][]): number {
  let minDist = Infinity;
  let bestIdx = 0;
  for (let i = 0; i < routeCoords.length; i++) {
    const [rLng, rLat] = routeCoords[i];
    const d = haversineKm(lat, lng, rLat, rLng);
    if (d < minDist) { minDist = d; bestIdx = i; }
  }
  return bestIdx / (routeCoords.length - 1);
}

type OsmElement = {
  id?: number | string;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string | undefined>;
};

export interface RoutePlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  category: string;
  distanceFromRoute: number; // km from nearest route point
  routeProgress: number;     // 0..1 fraction along route
  rating: number | null;
  opening_hours?: string;
  tags?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  let body: { coords?: unknown; category?: unknown; corridorM?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawCoords = body.coords;
  const rawCategory = typeof body.category === "string" ? body.category : "all";
  const corridorM = Math.min(Math.max(Number(body.corridorM) || 500, 100), 2000);

  if (!Array.isArray(rawCoords) || rawCoords.length < 2) {
    return NextResponse.json({ error: "coords array with ≥2 [lng,lat] pairs required" }, { status: 400 });
  }

  const coords = rawCoords as [number, number][];
  const category = ALLOWED_CATEGORIES.has(rawCategory) ? rawCategory : "all";

  const bbox = buildBBox(coords);
  if (!bbox) return NextResponse.json({ error: "Cannot compute bounding box" }, { status: 400 });

  const namePattern = OSM_NAME_PATTERNS[category] || OSM_NAME_PATTERNS.all;

  // Sample points for corridor search
  const samples = samplePoints(coords, 10);

  // Build Overpass query: bbox search + around-corridor search on sampled points
  const aroundParts = samples.map(([lng, lat]) =>
    `node["name"~"${namePattern}",i](around:${corridorM},${lat},${lng});
     way["name"~"${namePattern}",i](around:${corridorM},${lat},${lng});`
  ).join("\n");

  // Also search by amenity type in bbox
  let amenityFilter = "";
  if (category !== "all") {
    const amenities = OSM_AMENITY_MAP[category] || [];
    if (amenities.length > 0) {
      const aFilter = amenities.map(a => `"${a}"`).join("|");
      amenityFilter = `
        node["amenity"~${aFilter}](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"~${aFilter}](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      `;
    }
  }

  const query = `[out:json][timeout:20];
(
  ${aroundParts}
  ${amenityFilter}
);
out center 80;`;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Adumate/1.0 (https://adumate.in)",
      },
      signal: AbortSignal.timeout(18000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Overpass query failed", places: [] }, { status: 502 });
    }

    const data = await res.json();
    const elements: OsmElement[] = data.elements || [];

    // Deduplicate by name + coords
    const seen = new Set<string>();
    const places: RoutePlace[] = [];

    for (const el of elements) {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      const name = el.tags?.name || el.tags?.["name:en"] || "";
      if (!name || !lat || !lng) continue;

      const key = `${name.toLowerCase()}|${Number(lat).toFixed(4)}|${Number(lng).toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const distFromRoute = distanceToRoute(lat, lng, coords);
      // Only include places within corridor
      if (distFromRoute * 1000 > corridorM + 100) continue;

      const progress = routeProgress(lat, lng, coords);

      // Determine category from tags
      let detectedCat = "service";
      const tags = el.tags || {};
      const tagName = (tags.name || "").toLowerCase();
      if (/library|reading|study/.test(tagName) || tags.amenity === "library") detectedCat = "library";
      else if (/hostel|pg|paying guest|dormitory/.test(tagName)) detectedCat = "hostel";
      else if (/mess|tiffin|canteen|dhaba/.test(tagName)) detectedCat = "mess";
      else if (/coaching|tuition|academy|tutorial|institute|classes/.test(tagName)) detectedCat = "tutor";
      else if (/company|solutions|technologies|startup/.test(tagName)) detectedCat = "job";

      places.push({
        id: String(el.id),
        name,
        address: [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ") || tags["addr:full"] || "",
        lat,
        lng,
        phone: tags.phone || tags["contact:phone"] || "",
        website: tags.website || tags["contact:website"] || "",
        category: detectedCat,
        distanceFromRoute: distFromRoute,
        routeProgress: progress,
        rating: null,
        opening_hours: tags.opening_hours,
        tags: Object.fromEntries(
          Object.entries(tags).filter(([, v]) => v !== undefined)
        ) as Record<string, string>,
      });
    }

    // Sort by route progress (appearance order as you travel)
    places.sort((a, b) => a.routeProgress - b.routeProgress);

    return NextResponse.json(
      { places, total: places.length },
      { headers: { "Cache-Control": "s-maxage=180, stale-while-revalidate=60" } }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch route places", places: [] },
      { status: 500 }
    );
  }
}
