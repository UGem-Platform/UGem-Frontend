// ============================================================
// VietMap API Service
// Tích hợp: Geocode (text → tọa độ) + Route (tìm đường)
// ============================================================

const VIETMAP_API_KEY = import.meta.env.VITE_VIETMAP_API_KEY ?? "";
const VIETMAP_SERVICE_KEY = import.meta.env.VITE_VIETMAP_SERVICE_KEY ?? "";

const HAS_VIETMAP_KEY =
  Boolean(VIETMAP_API_KEY) && VIETMAP_API_KEY !== "YOUR_VIETMAP_API_KEY_HERE";

const HAS_VIETMAP_SERVICE_KEY =
  Boolean(VIETMAP_SERVICE_KEY) &&
  VIETMAP_SERVICE_KEY !== "YOUR_VIETMAP_API_KEY_HERE";

/**
 * Style URL cho bản đồ:
 * - Nếu có VietMap API key → dùng VietMap tiles (bản đồ Việt Nam đẹp)
 * - Nếu không có → dùng OpenFreeMap miễn phí (OSM)
 */
export const VIETMAP_STYLE_URL = HAS_VIETMAP_KEY
  ? "https://tiles.openfreemap.org/styles/liberty" // Tạm dùng fallback để test
  : "https://tiles.openfreemap.org/styles/liberty";

export {
  HAS_VIETMAP_KEY,
  HAS_VIETMAP_SERVICE_KEY,
  VIETMAP_API_KEY,
  VIETMAP_SERVICE_KEY,
};

// ─── Types ────────────────────────────────────────────────────

export type LngLat = { lng: number; lat: number };

export interface GeocodeResult {
  ref_id: string;
  name: string;
  display: string;
  address: string;
  lat: number;
  lng: number;
}

export interface RouteStep {
  distance: number; // metres
  duration: number; // seconds
  instruction: string;
}

export interface RouteResult {
  /** Array of [lng, lat] pairs forming the path */
  coordinates: [number, number][];
  distance: number; // total metres
  duration: number; // total seconds
  steps: RouteStep[];
}

type OsrmStep = {
  distance: number;
  duration: number;
  name?: string;
  maneuver?: {
    type?: string;
    modifier?: string;
  };
};

// ─── Geocode: địa chỉ text → tọa độ ─────────────────────────

export async function geocodeAddress(text: string): Promise<GeocodeResult[]> {
  if (!HAS_VIETMAP_SERVICE_KEY)
    throw new Error("Chưa cấu hình VietMap Service key");

  const url = new URL("https://maps.vietmap.vn/api/search/v3");
  url.searchParams.set("apikey", VIETMAP_SERVICE_KEY);
  url.searchParams.set("text", text);
  url.searchParams.set("size", "5");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocode API error: ${res.status}`);

  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

// ─── Route: tính đường đi giữa 2 điểm ───────────────────────

export async function getRoute(
  origin: LngLat,
  destination: LngLat,
  vehicle: "car" | "bike" | "foot" | "motorcycle" = "motorcycle",
): Promise<RouteResult> {
  // 1. Nếu có Service Key VietMap -> Dùng VietMap Route API v1.1
  if (HAS_VIETMAP_SERVICE_KEY) {
    const url = new URL("https://maps.vietmap.vn/api/route");
    url.searchParams.set("api-version", "1.1");
    url.searchParams.set("apikey", VIETMAP_SERVICE_KEY);
    url.searchParams.append("point", `${origin.lat},${origin.lng}`);
    url.searchParams.append("point", `${destination.lat},${destination.lng}`);
    url.searchParams.set("vehicle", vehicle);
    // points_encoded=false → GeoJSON LineString (array of [lng, lat])
    url.searchParams.set("points_encoded", "false");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Route API error: ${res.status}`);

    const json = await res.json();
    const path = json?.paths?.[0];
    if (!path) throw new Error("Không tìm được đường đi");

    const coordinates: [number, number][] =
      (path.points?.coordinates as [number, number][]) ?? [];

    const steps: RouteStep[] = (path.instructions ?? []).map(
      (ins: { distance: number; time: number; text: string }) => ({
        distance: ins.distance,
        duration: ins.time / 1000,
        instruction: ins.text,
      }),
    );

    return {
      coordinates,
      distance: path.distance ?? 0,
      duration: (path.time ?? 0) / 1000,
      steps,
    };
  }

  // 2. Fallback miễn phí: Dùng OSRM (Open Source Routing Machine) khi chưa có API key
  const osrmVehicle =
    vehicle === "foot" ? "foot" : vehicle === "bike" ? "bike" : "driving";
  const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmVehicle}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(osrmUrl);
  if (!res.ok) throw new Error("Không thể tìm đường đi (OSRM error)");

  const json = await res.json();
  const route = json?.routes?.[0];
  if (!route) throw new Error("Không tìm được đường đi");

  const coordinates: [number, number][] = route.geometry?.coordinates ?? [];
  const steps: RouteStep[] = (route.legs?.[0]?.steps ?? []).map(
    (step: OsrmStep) => ({
      distance: step.distance,
      duration: step.duration,
      instruction:
        step.maneuver?.type === "turn"
          ? `Rẽ ${step.maneuver.modifier} vào ${step.name || "đường không tên"}`
          : step.maneuver?.type === "depart"
            ? "Bắt đầu xuất phát"
            : step.maneuver?.type === "arrive"
              ? "Đến nơi"
              : `Đi tiếp ${step.name || ""}`,
    }),
  );

  return {
    coordinates,
    distance: route.distance,
    duration: route.duration,
    steps,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

export function metersToKm(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function secondsToText(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h} giờ ${rem} phút` : `${h} giờ`;
}
