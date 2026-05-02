/**
 * NearbyMerchantsMap - ban do quan an gan ban
 * Su dung MapLibre GL + VietMap tiles/OSM fallback
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
}>;

type MerchantRecord = Record<string, unknown>;

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
}: Props) {
  const markers = useMemo<MapMarker[]>(() => {
    return merchants.flatMap((merchant) => {
      const coords = getMerchantCoords(merchant);
      if (!coords) return [];

      const name = merchant.name || "Unnamed merchant";
      const distanceText =
        typeof merchant.distance === "number" &&
        Number.isFinite(merchant.distance)
          ? `<div style="color:#6b7280;font-size:12px;margin-top:2px">📏 ${merchant.distance.toFixed(1)} km</div>`
          : "";

      return [
        {
          id: merchant.id,
          lat: coords.lat,
          lng: coords.lng,
          type: "restaurant",
          popupHtml: `
            <div style="min-width:150px;padding:2px 0">
              <div style="font-weight:700;font-size:14px">${name}</div>
              ${distanceText}
              ${merchant.address ? `<div style="font-size:12px;color:#374151;margin-top:3px">🏠 ${merchant.address}</div>` : ""}
              <div style="margin-top:6px;font-size:11px;color:#3b82f6;font-weight:600">Click de xem duong di →</div>
            </div>
          `,
        },
      ];
    });
  }, [merchants]);

  return (
    <VietMapGL
      centerLng={center.longitude}
      centerLat={center.latitude}
      zoom={14}
      markers={markers}
      selectedMarkerId={selectedMerchantId}
      onMarkerClick={(markerId) => {
        onSelectMerchantId?.(markerId);
      }}
      routeCoordinates={routeCoordinates}
      routeColor="#3b82f6"
      className="h-full w-full"
    />
  );
}
