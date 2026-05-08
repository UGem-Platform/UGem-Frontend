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
  /** If true, make user marker draggable for confirmation */
  editableUserMarker?: boolean;
  onUserMarkerDrag?: (lat: number, lng: number) => void;
}>;

type MerchantRecord = Record<string, unknown>;

const USER_MARKER_ID = "__user-location";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRating(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Chưa có";

  return value.toFixed(2);
}

function getUnderratedScore(merchant?: Merchant | null) {
  if (!merchant) return null;

  const record = merchant as MerchantRecord;
  const raw = record.underratedScore ?? record.underrated_score ?? record.US;

  if (typeof raw === "number" && Number.isFinite(raw)) return raw;

  if (typeof raw === "string") {
    const parsed = Number(raw.trim());
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function getMerchantScale(score: number | null) {
  if (score === null) return 1;

  const clamped = Math.max(0, Math.min(100, score));
  return 1.05 + (clamped / 100) * 0.35;
}

function shouldUseFlame(score: number | null) {
  return score !== null && score >= 80;
}

function extractDescriptionField(
  description: string | undefined,
  label: string,
) {
  if (!description) return "";

  const prefix = `${label}:`;

  return (
    description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.toLowerCase().startsWith(prefix.toLowerCase()))
      ?.slice(prefix.length)
      .trim() ?? ""
  );
}

function getMerchantCuisineLabel(merchant: Merchant) {
  const fromDescription = extractDescriptionField(
    merchant.description,
    "Loại món chính",
  );

  if (fromDescription) return fromDescription;

  const menuCategories = merchant.menu
    ?.flatMap((item) => item.categoryDetail ?? [])
    .filter(Boolean)
    .slice(0, 3);

  return menuCategories?.length ? menuCategories.join(", ") : "Chưa cập nhật";
}

function getMerchantPopupHtml(merchant: Merchant) {
  const name = escapeHtml(merchant.name || "Unnamed merchant");
  const ratingText = formatRating(merchant.rating);
  const cuisine = escapeHtml(getMerchantCuisineLabel(merchant));

  return `
    <div style="min-width:180px;max-width:220px;padding:2px 0">
      <div style="font-weight:800;font-size:14px;line-height:1.3;color:#0f172a">${name}</div>
      <div style="margin-top:4px;color:#0f766e;font-size:12px;font-weight:700">Review: ${ratingText}</div>
      <div style="margin-top:4px;color:#475569;font-size:12px"><strong>Loại món:</strong> ${cuisine}</div>
    </div>
  `;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 0.001) return "Ngay gần bạn";
  if (distanceKm < 1) return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
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
  editableUserMarker,
  onUserMarkerDrag,
}: Props) {
  const markers = useMemo<MapMarker[]>(() => {
    const userMarker: MapMarker = {
      id: USER_MARKER_ID,
      lat: center.latitude,
      lng: center.longitude,
      type: "user",
      draggable: !!editableUserMarker,
      popupHtml:
        '<div style="font-weight:700;font-size:13px;padding:2px 4px">Vị trí của bạn</div>',
    };

    const merchantMarkers = merchants.flatMap((merchant) => {
      const coords = getMerchantCoords(merchant);
      if (!coords) return [];

      const score = getUnderratedScore(merchant);
      return [
        {
          id: merchant.id,
          lat: coords.lat,
          lng: coords.lng,
          type: "restaurant" as const,
          scale: getMerchantScale(score),
          flame: shouldUseFlame(score),
          popupHtml: getMerchantPopupHtml(merchant),
        },
      ];
    });

    return [userMarker, ...merchantMarkers];
  }, [center.latitude, center.longitude, editableUserMarker, merchants]);

  return (
    <div className="relative h-full w-full">
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
        editableUserMarker={editableUserMarker}
        onUserMarkerDrag={(lng, lat) => onUserMarkerDrag?.(lat, lng)}
        className="h-full w-full"
      />
    </div>
  );
}
