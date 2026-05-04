/**
 * NearbyMerchantsMap - ban do quan an gan ban
 * Su dung VietMap GL JS
 */
import { useMemo } from "react";
import VietMapGL, { type MapMarker } from "@/shared/components/VietMapGL";
import type { Merchant } from "../types";

type LatLng = { latitude: number; longitude: number };

type Props = Readonly<{
  center: LatLng;
  merchants: Merchant[];
  selectedMerchantId?: string | null;
  onSelectMerchantId?: (id: string) => void;
  /** Toa do route [lng, lat][] de ve duong di */
  routeCoordinates?: [number, number][];
  onLocateCustomer?: () => void;
  locateLoading?: boolean;
}>;

type MerchantRecord = Record<string, unknown>;

const USER_MARKER_ID = "__user-location";

function formatDistance(distanceKm: number) {
  if (distanceKm < 0.001) return "Ngay gần bạn";
  if (distanceKm < 1) return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getNumberField(record: MerchantRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function getMerchantCoords(
  merchant: Merchant,
): { lat: number; lng: number } | null {
  const record = merchant as MerchantRecord;

  const lat = getNumberField(record, ["latitude", "lat", "Latitude", "Lat"]);
  const lng = getNumberField(record, ["longitude", "lng", "Longitude", "Lng"]);

  if (lat === null || lng === null) return null;
  return { lat, lng };
}

export default function NearbyMerchantsMap({
  center,
  merchants,
  selectedMerchantId,
  onSelectMerchantId,
  routeCoordinates,
  onLocateCustomer,
  locateLoading,
}: Props) {
  const markers = useMemo<MapMarker[]>(() => {
    const userMarker: MapMarker = {
      id: USER_MARKER_ID,
      lat: center.latitude,
      lng: center.longitude,
      type: "user",
      popupHtml:
        '<div style="font-weight:700;font-size:13px;padding:2px 4px">Vị trí của bạn</div>',
    };

    const merchantMarkers = merchants.flatMap((merchant) => {
      const coords = getMerchantCoords(merchant);
      if (!coords) return [];

      const name = escapeHtml(merchant.name || "Unnamed merchant");
      const distanceText =
        typeof merchant.distance === "number" &&
        Number.isFinite(merchant.distance)
          ? `<div style="color:#6b7280;font-size:12px;margin-top:2px">${formatDistance(merchant.distance)}</div>`
          : "";
      const addressText = merchant.address
        ? `<div style="font-size:12px;color:#374151;margin-top:3px">${escapeHtml(merchant.address)}</div>`
        : "";

      return [
        {
          id: merchant.id,
          lat: coords.lat,
          lng: coords.lng,
          type: "restaurant" as const,
          popupHtml: `
            <div style="min-width:150px;padding:2px 0">
              <div style="font-weight:700;font-size:14px">${name}</div>
              ${distanceText}
              ${addressText}
              <div style="margin-top:6px;font-size:11px;color:#0891b2;font-weight:700">Bấm để xem đường đi</div>
            </div>
          `,
        },
      ];
    });

    return [userMarker, ...merchantMarkers];
  }, [center.latitude, center.longitude, merchants]);

  return (
    <VietMapGL
      centerLng={center.longitude}
      centerLat={center.latitude}
      zoom={14}
      markers={markers}
      selectedMarkerId={selectedMerchantId}
      onMarkerClick={(markerId) => {
        if (markerId !== USER_MARKER_ID) {
          onSelectMerchantId?.(markerId);
        }
      }}
      routeCoordinates={routeCoordinates}
      routeColor="#e11d48"
      fitToMarkers
      onLocateClick={onLocateCustomer}
      locateLoading={locateLoading}
      className="h-full w-full"
    />
  );
}
