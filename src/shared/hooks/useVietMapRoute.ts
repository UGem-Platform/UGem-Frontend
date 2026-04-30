/**
 * useVietMapRoute – hook quản lý geocode + tính route
 *
 * Cách dùng:
 *   const { geocode, route, routeResult, loading, error } = useVietMapRoute();
 *
 *   // Geocode địa chỉ text → tọa độ
 *   const results = await geocode("123 Nguyễn Huệ, TP.HCM");
 *
 *   // Tính route giữa 2 điểm
 *   await route({ lng: 106.675, lat: 10.759 }, { lng: 106.668, lat: 10.803 });
 *   // → routeResult.coordinates để truyền vào VietMapGL
 */
import { useState, useCallback } from "react";
import {
  geocodeAddress,
  getRoute,
  type GeocodeResult,
  type RouteResult,
  type LngLat,
} from "@/shared/services/vietmapService";

export function useVietMapRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);

  // ── Geocode ──
  const geocode = useCallback(async (text: string) => {
    if (!text.trim()) return [];
    setLoading(true);
    setError(null);
    try {
      const results = await geocodeAddress(text);
      setGeocodeResults(results);
      return results;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Geocode thất bại";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Route ──
  const route = useCallback(
    async (
      origin: LngLat,
      destination: LngLat,
      vehicle: "car" | "bike" | "foot" = "car"
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getRoute(origin, destination, vehicle);
        setRouteResult(result);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Tính route thất bại";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Clear ──
  const clearRoute = useCallback(() => {
    setRouteResult(null);
  }, []);

  return {
    geocode,
    route,
    clearRoute,
    routeResult,
    geocodeResults,
    loading,
    error,
  };
}
