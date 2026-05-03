import { NextResponse } from "next/server";

function isValidCoordPair(val: string | null): boolean {
  if (!val) return false;
  const parts = val.split(",");
  if (parts.length !== 2) return false;
  const [lon, lat] = parts.map(Number);
  return !isNaN(lon) && !isNaN(lat) && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

const PROFILES: Record<string, string> = {
  driving: "driving-car",
  walking: "foot-walking",
  cycling: "cycling-regular",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const mode = searchParams.get("mode") || "driving";

  if (!isValidCoordPair(start) || !isValidCoordPair(end)) {
    return NextResponse.json({ error: "Invalid or missing coordinates" }, { status: 400 });
  }

  const profile = PROFILES[mode] || "driving-car";
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Routing service unavailable" }, { status: 503 });
  }

  try {
    // Use POST for full step-by-step instructions
    const orsRes = await fetch(
      `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
      {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            start!.split(",").map(Number),
            end!.split(",").map(Number),
          ],
          instructions: true,
          language: "en",
          units: "km",
        }),
        next: { revalidate: 0 },
      }
    );

    const data = await orsRes.json();
    if (!orsRes.ok) {
      return NextResponse.json({ error: "Route not available for this destination." }, { status: 502 });
    }

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to fetch route. Please try again." }, { status: 500 });
  }
}
