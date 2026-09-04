import { NextRequest, NextResponse } from "next/server";

// SECURITY: Server-side only — NEVER use NEXT_PUBLIC_ here (it leaks into browser bundle)
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Whitelist of allowed categories — prevents injection into OSM/Google queries
const ALLOWED_CATEGORIES = new Set(["library", "hostel", "mess", "tutor", "job"]);

function isValidLat(val: string | null): boolean {
  const n = Number(val);
  return val !== null && val.trim() !== "" && !isNaN(n) && n >= -90 && n <= 90;
}

function isValidLon(val: string | null): boolean {
  const n = Number(val);
  return val !== null && val.trim() !== "" && !isNaN(n) && n >= -180 && n <= 180;
}

const GOOGLE_CATEGORY_MAP: Record<string, { type: string; keyword: string }> = {
  library: { type: "library", keyword: "library study room reading" },
  hostel: { type: "lodging", keyword: "hostel pg student accommodation" },
  mess: { type: "restaurant", keyword: "mess tiffin canteen" },
  tutor: { type: "school", keyword: "coaching tutor tuition" },
  job: { type: "point_of_interest", keyword: "office company startup" },
};

const OSM_QUERY_PARTS: Record<string, string[]> = {
  library: [
    '["amenity"="library"]',
    '["name"~"library|reading room|study",i]',
  ],
  hostel: [
    '["tourism"~"hostel|guest_house|apartment",i]',
    '["building"~"dormitory|residential",i]["name"~"hostel|pg|paying guest",i]',
    '["name"~"hostel|pg|paying guest|boys hostel|girls hostel",i]',
  ],
  mess: [
    '["amenity"~"restaurant|fast_food|cafe",i]["name"~"mess|tiffin|canteen|dhaba",i]',
    '["name"~"mess|tiffin|canteen|dhaba",i]',
  ],
  tutor: [
    '["amenity"~"school|college|university",i]',
    '["name"~"coaching|tuition|academy|tutorial|institute",i]',
  ],
  job: [
    '["office"]',
    '["amenity"="coworking"]',
    '["name"~"company|solutions|technologies|startup|private limited|pvt ltd",i]',
  ],
};

type GoogleNearbyResult = {
  place_id?: string;
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{ photo_reference: string }>;
};

type OsmElement = {
  id?: number | string;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string | undefined>;
};

// Haversine distance in km between two lat/lng points
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchFromGoogle(lat: string, lon: string, category: string, radius: string) {
  if (!GOOGLE_KEY) return null;

  const cfg = GOOGLE_CATEGORY_MAP[category] || GOOGLE_CATEGORY_MAP.library;
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lon}`);
  url.searchParams.set("radius", radius);
  url.searchParams.set("type", cfg.type);
  url.searchParams.set("keyword", cfg.keyword);
  url.searchParams.set("key", GOOGLE_KEY);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Google Places error ${res.status}`);

  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message || `Google Places status ${data.status}`);
  }

  const places = (data.results as GoogleNearbyResult[] || []).map((p) => ({
    id: p.place_id,
    placeId: p.place_id,
    name: p.name || "",
    address: p.vicinity || p.formatted_address || "",
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,   // ✅ fixed: was `lon`, Map.tsx needs `lng`
    lon: p.geometry?.location?.lng,   // keep both for backwards compat
    photo_reference: p.photos?.[0]?.photo_reference || null,
    rating: p.rating ?? null,
    userRatingsTotal: p.user_ratings_total ?? null,
    phone: "",
    website: "",
    distanceKm: (p.geometry?.location?.lat && p.geometry?.location?.lng)
      ? haversineKm(Number(lat), Number(lon), p.geometry.location.lat, p.geometry.location.lng)
      : null,
  })).filter((p) => p.name && p.lat && p.lng);

  return { source: "google", places };
}

async function fetchFromOsm(lat: string, lon: string, category: string, radius: string) {
  const parts = OSM_QUERY_PARTS[category] || OSM_QUERY_PARTS.library;
  const maxRadius = Math.min(Math.max(Number(radius) || 10000, 1000), 20000);
  const union = parts.map((part) => `
      node${part}(around:${maxRadius},${lat},${lon});
      way${part}(around:${maxRadius},${lat},${lon});
      relation${part}(around:${maxRadius},${lat},${lon});
  `).join("\n");

  const query = `[out:json][timeout:28];
  (
    ${union}
  );
  out center 120;`;

  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const data = await res.json();

  const rawPlaces = (data.elements as OsmElement[] || [])
    .map((el) => ({
      id: String(el.id),
      name: el.tags?.name || el.tags?.["name:en"] || "",
      address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || el.tags?.["addr:full"] || "",
      phone: el.tags?.phone || el.tags?.["contact:phone"] || "",
      website: el.tags?.website || el.tags?.["contact:website"] || "",
      lat: el.lat ?? el.center?.lat,
      lng: el.lon ?? el.center?.lon,  // ✅ fixed: Map.tsx uses `lng`, was `lon`
      lon: el.lon ?? el.center?.lon,  // keep both for backwards compat
      rating: null,
      userRatingsTotal: null,
    }))
    .filter((p) => p.name && p.lat && p.lng);

  // Deduplicate by rounded coordinates + lowercase name
  const dedupedMap = new Map<string, typeof rawPlaces[number]>();
  for (const place of rawPlaces) {
    const key = `${place.name.toLowerCase()}|${Number(place.lat).toFixed(5)}|${Number(place.lng).toFixed(5)}`;
    if (!dedupedMap.has(key)) dedupedMap.set(key, place);
  }

  // Add distance + sort by nearest first
  const userLat = Number(lat);
  const userLng = Number(lon);
  const places = Array.from(dedupedMap.values())
    .map((p) => ({
      ...p,
      distanceKm: haversineKm(userLat, userLng, Number(p.lat), Number(p.lng)),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 80);

  return { source: "osm", places };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const rawCategory = searchParams.get("category") || "library";
  const rawRadius = searchParams.get("radius") || "10000";

  // --- Input Validation ---
  if (!isValidLat(lat)) {
    return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
  }
  if (!isValidLon(lon)) {
    return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
  }
  // Whitelist category to prevent injection into OSM/Google queries
  const category = ALLOWED_CATEGORIES.has(rawCategory) ? rawCategory : "library";
  // Clamp radius to safe range
  const radius = String(Math.min(Math.max(Number(rawRadius) || 10000, 500), 20000));

  try {
    const googleData = await fetchFromGoogle(lat!, lon!, category, radius);
    if (googleData) {
      return NextResponse.json(googleData, {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
      });
    }
  } catch {
    // fall through to OSM fallback
  }

  try {
    const osmData = await fetchFromOsm(lat!, lon!, category, radius);
    return NextResponse.json(osmData, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    // Generic error — never leak internal details to client
    return NextResponse.json(
      { error: "Unable to fetch places. Please try again.", places: [] },
      { status: 500 }
    );
  }
}
