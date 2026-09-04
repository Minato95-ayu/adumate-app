import { NextRequest, NextResponse } from "next/server";

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  if (!GOOGLE_KEY) {
    return NextResponse.json({ error: "Google Maps API Key missing" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,url");
    url.searchParams.set("key", GOOGLE_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } }); // Cache for 1 day
    if (!res.ok) throw new Error(`Google Places Details error ${res.status}`);

    const data = await res.json();
    if (data.status !== "OK") {
      throw new Error(data.error_message || `Google Places status ${data.status}`);
    }

    const result = data.result;

    // Process photos into direct URLs
    const photos = (result.photos || []).slice(0, 5).map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_KEY}`
    );

    // Process reviews
    const reviews = (result.reviews || []).slice(0, 5).map((r: any) => ({
      author_name: r.author_name,
      author_url: r.author_url,
      profile_photo_url: r.profile_photo_url,
      rating: r.rating,
      text: r.text,
      relative_time_description: r.relative_time_description,
      time: r.time,
    }));

    const responseData = {
      id: placeId,
      name: result.name,
      address: result.formatted_address,
      phone: result.formatted_phone_number || "",
      website: result.website || result.url || "",
      rating: result.rating || null,
      userRatingsTotal: result.user_ratings_total || null,
      photos: photos,
      reviews: reviews,
      openingHours: result.opening_hours?.weekday_text || [],
      isOpen: result.opening_hours?.open_now ?? null,
    };

    return NextResponse.json(responseData, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" },
    });

  } catch (error: any) {
    console.error("Place details error:", error);
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 });
  }
}
