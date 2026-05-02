import { NextRequest, NextResponse } from "next/server";

// SECURITY: Server-side only — NEVER use NEXT_PUBLIC_ here (it leaks into browser bundle)
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function geocodePhoton(city: string) {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", `${city}, India`);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
    headers: { "User-Agent": "Adumate/1.0 (student-ecosystem-app)" },
  });
  if (!res.ok) throw new Error(`Photon geocode error ${res.status}`);
  const data = await res.json();
  const first = data?.features?.[0];
  const coords = first?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lon = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!lat || !lon) return null;

  const props = first?.properties || {};

  return {
    lat,
    lon,
    displayName: [props.name, props.city, props.state, props.country].filter(Boolean).join(", "),
    source: "photon",
  };
}

async function geocodeGoogle(city: string) {
  if (!GOOGLE_KEY) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", `${city}, India`);
  url.searchParams.set("key", GOOGLE_KEY);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Google geocode error ${res.status}`);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]) return null;
  const first = data.results[0];
  return {
    lat: Number(first.geometry.location.lat),
    lon: Number(first.geometry.location.lng),
    displayName: first.formatted_address,
    source: "google",
  };
}

async function geocodeOsm(city: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${city}, India`)}&format=json&limit=1`,
    { headers: { "User-Agent": "Adumate/1.0 (student-ecosystem-app)" } }
  );
  const data = await res.json();
  if (!data?.[0]) return null;
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
    source: "osm",
  };
}

export async function GET(req: NextRequest) {
  // Public endpoint — no auth required for geocoding

  const rawCity = new URL(req.url).searchParams.get("city");
  if (!rawCity) return NextResponse.json({ error: "city required" }, { status: 400 });

  // --- Input Sanitization ---
  // Trim, limit length, allow only letters/numbers/spaces/commas/hyphens
  const city = rawCity.trim().slice(0, 100).replace(/[^a-zA-Z0-9\s,\-\.]/g, "");
  if (city.length < 2) {
    return NextResponse.json({ error: "Invalid city name" }, { status: 400 });
  }

  try {
    const photonResult = await geocodePhoton(city);
    if (photonResult) return NextResponse.json(photonResult);
  } catch {
    // fallback
  }

  try {
    const googleResult = await geocodeGoogle(city);
    if (googleResult) return NextResponse.json(googleResult);
  } catch {
    // fallback to OSM
  }

  try {
    const osmResult = await geocodeOsm(city);
    if (!osmResult) return NextResponse.json({ error: "City not found" }, { status: 404 });
    return NextResponse.json(osmResult);
  } catch {
    // Generic error — never leak internal details to client
    return NextResponse.json({ error: "Unable to geocode. Please try again." }, { status: 500 });
  }
}
