import { NextResponse } from "next/server";

// Validate "lon,lat" coordinate pair format
function isValidCoordPair(val: string | null): boolean {
  if (!val) return false;
  const parts = val.split(",");
  if (parts.length !== 2) return false;
  const [lon, lat] = parts.map(Number);
  return !isNaN(lon) && !isNaN(lat) && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // --- Input Validation ---
  if (!isValidCoordPair(start) || !isValidCoordPair(end)) {
    return NextResponse.json({ error: "Invalid or missing coordinates" }, { status: 400 });
  }

  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Routing service unavailable" }, { status: 503 });
  }

  try {
    const url = new URL("https://api.openrouteservice.org/v2/directions/driving-car");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("start", start!);
    url.searchParams.set("end", end!);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json, application/geo+json",
      },
      next: { revalidate: 0 },
    });

    const data = await response.json();

    if (!response.ok) {
      // Don't expose internal ORS error details to client
      return NextResponse.json(
        { error: "Route not available for this destination." },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch route. Please try again." }, { status: 500 });
  }
}
