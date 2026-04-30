/**
 * NearbyMerchantsMap – bản đồ quán ăn gần bạn
 * Sử dụng MapLibre GL + VietMap tiles/OSM fallback
 */
import { useMemo } from "react";
import VietMapGL, { type MapMarker } from "@/shared/components/VietMapGL";
import type { Merchant } from "../types";

type LatLng = { latitude: number; longitude: number };

type Props = {
  center: LatLng;
  merchants: Merchant[];
  selectedMerchantId?: string | null;
  onSelectMerchantId?: (id: string) => void;
  /** Tọa độ route [lng, lat][] để vẽ đường đi */
  routeCoordinates?: [number, number][];
};

function getMerchantCoords(
  merchant: Merchant
): { lat: number; lng: number } | null {
  const any = merchant as unknown as Record<string, unknown>;

  const lat =
    (typeof merchant.latitude === "number" && merchant.latitude) ||
    (typeof merchant.lat === "number" && merchant.lat) ||
    (typeof any.Latitude === "number" && (any.Latitude as number)) ||
    (typeof any.Lat === "number" && (any.Lat as number));

  const lng =
    (typeof merchant.longitude === "number" && merchant.longitude) ||
    (typeof merchant.lng === "number" && merchant.lng) ||
    (typeof any.Longitude === "number" && (any.Longitude as number)) ||
    (typeof any.Lng === "number" && (any.Lng as number));

  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export default function NearbyMerchantsMap({
  center,
  merchants,
  selectedMerchantId,
  onSelectMerchantId,
  routeCoordinates,
}: Props) {
  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];

    // Vị trí người dùng
    list.push({
      id: "__user__",
      lat: center.latitude,
      lng: center.longitude,
      type: "user",
      popupHtml: `<div style="font-weight:600;font-size:13px">📍 Vị trí của bạn</div>`,
    });

    // Các quán ăn
    for (const merchant of merchants) {
      const coords = getMerchantCoords(merchant);
      if (!coords) continue;

      const name =
        merchant.name || merchant.merchantName || "Unnamed merchant";
      const distanceText =
        typeof merchant.distance === "number" &&
        Number.isFinite(merchant.distance)
          ? `<div style="color:#6b7280;font-size:12px;margin-top:2px">📏 ${merchant.distance.toFixed(1)} km</div>`
          : "";

      list.push({
        id: merchant.id,
        lat: coords.lat,
        lng: coords.lng,
        type: "restaurant",
        popupHtml: `
          <div style="min-width:150px;padding:2px 0">
            <div style="font-weight:700;font-size:14px">${name}</div>
            ${distanceText}
            ${merchant.address ? `<div style="font-size:12px;color:#374151;margin-top:3px">🏠 ${merchant.address}</div>` : ""}
            <div style="margin-top:6px;font-size:11px;color:#3b82f6;font-weight:600">Click để xem đường đi →</div>
          </div>
        `,
      });
    }

    return list;
  }, [center, merchants]);

  return (
    <VietMapGL
      centerLng={center.longitude}
      centerLat={center.latitude}
      zoom={14}
      markers={markers}
      selectedMarkerId={selectedMerchantId}
      onMarkerClick={(id) => {
        if (id !== "__user__") onSelectMerchantId?.(id);
      }}
      routeCoordinates={routeCoordinates}
      routeColor="#3b82f6"
      className="h-full w-full"
    />
  );
}
