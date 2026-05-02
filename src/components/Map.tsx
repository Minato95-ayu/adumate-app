"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Phone, Globe } from "lucide-react";
import { Provider } from "@/data/providers";

type Place = Provider & {
  phone?: string;
  website?: string;
  about?: string;
  services?: string[];
  social?: Provider["social"] & {
    linkedin?: string;
    facebook?: string;
    justdial?: string;
  };
};

interface RouteSummary {
  distanceKm: number;
  durationMin: number;
}

interface MapProps {
  providers: Place[];
  center?: { lat: number; lng: number };
  onScan?: () => void;
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place | null) => void;
}

const userMarker = L.divIcon({
  html: `
    <div style="width:18px;height:18px;border-radius:999px;background:#2563eb;border:3px solid #ffffff;box-shadow:0 0 0 8px rgba(37,99,235,0.18);"></div>
  `,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const placeMarker = L.divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:16px;background:linear-gradient(135deg,#f97316,#ef4444);border:3px solid rgba(255,255,255,0.95);box-shadow:0 10px 25px rgba(249,115,22,0.35);color:white;font-weight:800;font-size:14px;">A</div>
  `,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -28],
});

function RecenterMap({
  center,
  selectedPlace,
  routePoints,
}: {
  center: { lat: number; lng: number };
  selectedPlace: Place | null | undefined;
  routePoints: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (routePoints.length > 1) {
      map.fitBounds(routePoints, { padding: [50, 50] });
      return;
    }

    if (selectedPlace) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], 15, { duration: 0.8 });
      return;
    }

    map.flyTo([center.lat, center.lng], 13, { duration: 0.8 });
  }, [center, map, routePoints, selectedPlace]);

  return null;
}

function RouteSummaryPill({
  summary,
  loading,
  error,
  onRefresh,
}: {
  summary: RouteSummary | null;
  loading: boolean;
  error: string;
  onRefresh?: () => void;
}) {
  if (!summary && !loading && !error) return null;

  return (
    <div className="absolute left-1/2 top-4 z-[500] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#08101c]/92 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Smart Route
          </p>
          {loading && <p className="text-sm font-semibold text-slate-200">Finding best route...</p>}
          {!loading && error && <p className="text-sm font-semibold text-rose-300">{error}</p>}
          {!loading && summary && (
            <p className="text-sm font-semibold text-slate-100">
              {summary.distanceKm.toFixed(1)} km • {summary.durationMin.toFixed(0)} min drive
            </p>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

function ensureUrl(value?: string): string {
  if (!value) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    // Only allow safe protocols — block javascript:, data:, etc.
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export default function Map({
  providers,
  center = { lat: 28.6139, lng: 77.209 },
  onScan,
  selectedPlace,
  onSelectPlace,
}: MapProps) {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const routeTarget = selectedPlace ?? null;

  const routeUrl = useMemo(() => {
    if (!routeTarget) return "";
    return `/api/route?start=${center.lng},${center.lat}&end=${routeTarget.lng},${routeTarget.lat}`;
  }, [center.lat, center.lng, routeTarget]);

  const loadRoute = async () => {
    if (!routeUrl) {
      setRoutePoints([]);
      setRouteSummary(null);
      setRouteError("");
      return;
    }

    setRouteLoading(true);
    setRouteError("");

    try {
      const response = await fetch(routeUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch route");
      }

      const feature = data?.features?.[0];
      const coordinates = feature?.geometry?.coordinates;
      const summary = feature?.properties?.summary;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        throw new Error("Route not available for this place");
      }

      setRoutePoints(
        coordinates.map((point: [number, number]) => [point[1], point[0]])
      );
      setRouteSummary({
        distanceKm: Number(summary?.distance || 0) / 1000,
        durationMin: Number(summary?.duration || 0) / 60,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load route";
      setRoutePoints([]);
      setRouteSummary(null);
      setRouteError(message);
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadRoute();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUrl]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#08101c] shadow-2xl">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} selectedPlace={selectedPlace} routePoints={routePoints} />

        <Marker position={[center.lat, center.lng]} icon={userMarker}>
          <Popup>
            <div className="min-w-[160px]">
              <p className="text-sm font-bold text-slate-900">Your location</p>
              <p className="text-xs text-slate-600">Nearby services are mapped around you.</p>
              {onScan && (
                <button
                  onClick={onScan}
                  className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                >
                  Scan Again
                </button>
              )}
            </div>
          </Popup>
        </Marker>

        <CircleMarker
          center={[center.lat, center.lng]}
          radius={48}
          pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.08 }}
        />

        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={[provider.lat, provider.lng]}
            icon={placeMarker}
            eventHandlers={{
              click: () => onSelectPlace?.(provider),
            }}
          >
            <Popup>
              <div className="min-w-[220px]">
                <p className="text-sm font-bold text-slate-900">{provider.name}</p>
                <p className="mt-1 text-xs text-slate-600">{provider.address || "Student service"}</p>
                <p className="mt-1 text-xs font-semibold text-amber-600">
                  Rating {Number(provider.rating || 0).toFixed(1)}
                </p>
                <div className="mt-3 flex gap-2">
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      <Phone size={12} />
                      Call
                    </a>
                  )}
                  {provider.website && (
                    <a
                      href={ensureUrl(provider.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <Globe size={12} />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: "#f97316", weight: 6, opacity: 0.85, lineCap: "round" }}
          />
        )}
      </MapContainer>

      <RouteSummaryPill
        summary={routeSummary}
        loading={routeLoading}
        error={routeError}
        onRefresh={routeTarget ? loadRoute : undefined}
      />

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] hidden rounded-2xl border border-white/10 bg-[#08101c]/88 p-3 text-white shadow-xl backdrop-blur-xl md:block">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-300">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Live Map</p>
            <p className="text-sm font-semibold text-slate-100">
              OpenStreetMap + OpenRouteService routing
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
