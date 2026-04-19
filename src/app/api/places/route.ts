import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const category = searchParams.get("category") || "library";
  const radius = searchParams.get("radius") || "5000";

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const TAG_MAP: Record<string, string> = {
    library: '["amenity"="library"]',
    hostel:  '["tourism"="hostel"]',
    mess:    '["amenity"="restaurant"]',
    tutor:   '["amenity"="school"]',
    job:     '["office"="company"]',
  };

  const tag = TAG_MAP[category] || '["amenity"="library"]';
  const query = `[out:json][timeout:25];(node${tag}(around:${radius},${lat},${lon});way${tag}(around:${radius},${lat},${lon}););out center 40;`;

  try {
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { next: { revalidate: 300 } } // cache 5 min
    );

    if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
    const data = await res.json();

    const places = (data.elements || [])
      .map((el: any) => ({
        id: el.id,
        name: el.tags?.name || el.tags?.["name:en"] || "",
        address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || el.tags?.["addr:full"] || "",
        phone: el.tags?.phone || el.tags?.["contact:phone"] || "",
        website: el.tags?.website || el.tags?.["contact:website"] || "",
        lat: el.lat ?? el.center?.lat,
        lon: el.lon ?? el.center?.lon,
        openingHours: el.tags?.opening_hours || "",
      }))
      .filter((p: any) => p.name && p.lat && p.lon);

    return NextResponse.json({ places }, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, places: [] }, { status: 500 });
  }
}
