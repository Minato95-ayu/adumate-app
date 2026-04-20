import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

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
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("ORS Proxy Error:", error);
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 });
  }
}
