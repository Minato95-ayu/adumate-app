import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const city = new URL(req.url).searchParams.get("city");
  if (!city) return NextResponse.json({ error: "city required" }, { status: 400 });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", India")}&format=json&limit=1`,
      { headers: { "User-Agent": "Adumate/1.0 (student-ecosystem-app)" } }
    );
    const data = await res.json();
    if (!data?.[0]) return NextResponse.json({ error: "City not found" }, { status: 404 });
    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
