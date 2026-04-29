import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end coordinates" }, { status: 400 });
  }

  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ORS API key not configured" }, { status: 500 });
  }

  try {
    const url = new URL("https://api.openrouteservice.org/v2/directions/driving-car");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json, application/geo+json",
      },
      next: { revalidate: 0 },
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.message ||
        data?.details ||
        "Failed to fetch route from OpenRouteService";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("ORS Proxy Error:", error);
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 });
  }
}
