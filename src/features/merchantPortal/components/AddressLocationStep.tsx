import { useEffect, useRef, useState, useCallback } from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import type { OnboardingFormValues } from "../schema";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  type GeocodeResult,
  geocodeAddress as vietmapGeocodeAddress,
} from "@/shared/services/vietmapService";

type Props = {
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  setValue: UseFormSetValue<OnboardingFormValues>;
  watchedAddress?: string;
  watchedLat?: number;
  watchedLng?: number;
};

type ReverseGeoResult = {
  display_name?: string;
};

const DEFAULT_CENTER: [number, number] = [106.660172, 10.762622]; // lng, lat

export function AddressLocationStep({
  register,
  errors,
  setValue,
  watchedLat = 0,
  watchedLng = 0,
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geocodeSuggestions, setGeocodeSuggestions] = useState<GeocodeResult[]>(
    [],
  );
  const [geocodeStatus, setGeocodeStatus] = useState<"idle" | "ok" | "error">(
    "idle",
  );
  const [lastPicked, setLastPicked] = useState<{
    lat?: number;
    lng?: number;
  } | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeSeqRef = useRef(0);

  const createMarkerElement = useCallback(() => {
    const marker = document.createElement("div");
    marker.style.width = "18px";
    marker.style.height = "18px";
    marker.style.borderRadius = "999px";
    marker.style.background = "#e84f25";
    marker.style.border = "3px solid #ffffff";
    marker.style.boxShadow = "0 0 0 6px rgba(232, 79, 37, 0.18)";
    marker.style.transform = "translateY(-1px)";
    marker.style.position = "relative";
    marker.style.zIndex = "10";
    return marker;
  }, []);

  const isValidCoord = useCallback(
    (lat?: number | null, lng?: number | null) => {
      return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      );
    },
    [],
  );

  const placeMarker = useCallback(
    (map: maplibregl.Map, coords: [number, number]) => {
      const [lng, lat] = coords;
      if (!isValidCoord(lat, lng)) {
        console.warn("placeMarker: invalid coords", coords);
        return;
      }

      if (markerRef.current) {
        markerRef.current.setLngLat(coords);
      } else {
        markerRef.current = new maplibregl.Marker({
          element: createMarkerElement(),
          anchor: "bottom",
        })
          .setLngLat(coords)
          .addTo(map);
      }
    },
    [createMarkerElement, isValidCoord],
  );

  const syncMapToCoords = useCallback(
    (lat: number, lng: number) => {
      const map = mapRef.current;
      if (!map) return;

      placeMarker(map, [lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });
    },
    [placeMarker],
  );

  const commitCoordinates = useCallback(
    (lat: number, lng: number) => {
      if (!isValidCoord(lat, lng)) {
        console.warn("commitCoordinates: invalid", { lat, lng });
        setGeocodeStatus("error");
        return;
      }

      setValue("latitude", lat, { shouldDirty: true, shouldValidate: true });
      setValue("longitude", lng, { shouldDirty: true, shouldValidate: true });
      syncMapToCoords(lat, lng);
      setGeocodeStatus("ok");
    },
    [setValue, syncMapToCoords, isValidCoord],
  );

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "vi" },
      });
      const result: ReverseGeoResult = await res.json();

      return result.display_name?.trim() || "";
    } catch {
      return "";
    }
  }, []);

  const applyCoordinates = useCallback(
    async (lat: number, lng: number) => {
      commitCoordinates(lat, lng);

      const resolvedAddress = await reverseGeocode(lat, lng);
      if (resolvedAddress) {
        setValue("address", resolvedAddress, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [commitCoordinates, reverseGeocode, setValue],
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeocodeStatus("error");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(7));
        const lng = parseFloat(position.coords.longitude.toFixed(7));

        void applyCoordinates(lat, lng);
        setLocating(false);
      },
      () => {
        setGeocodeStatus("error");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  }, [applyCoordinates]);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initialCenter: [number, number] =
      watchedLng && watchedLat ? [watchedLng, watchedLat] : DEFAULT_CENTER;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: initialCenter,
      zoom: watchedLng && watchedLat ? 15 : 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      void applyCoordinates(
        parseFloat(lat.toFixed(7)),
        parseFloat(lng.toFixed(7)),
      );
    });

    mapRef.current = map;

    if (watchedLat && watchedLng) {
      map.on("load", () => placeMarker(map, [watchedLng, watchedLat]));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeMarker]);

  // Sync marker when lat/lng changes externally (e.g. geocoding update)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !watchedLat || !watchedLng) return;
    placeMarker(map, [watchedLng, watchedLat]);
    map.flyTo({ center: [watchedLng, watchedLat], zoom: 15, duration: 800 });
  }, [watchedLat, watchedLng, placeMarker]);

  const geocodeAddress = useCallback(
    async (address: string) => {
      const query = address.trim();
      if (query.length < 3) return;

      const seq = ++geocodeSeqRef.current;
      setGeocoding(true);
      setGeocodeStatus("idle");
      try {
        const map = mapRef.current;
        const proximity =
          map && map.getCenter()
            ? { lat: map.getCenter().lat, lng: map.getCenter().lng }
            : isValidCoord(watchedLat, watchedLng)
              ? { lat: watchedLat, lng: watchedLng }
              : undefined;

        const results = await vietmapGeocodeAddress(query, {
          proximity: proximity ?? null,
          size: 10,
        });

        if (seq !== geocodeSeqRef.current) return;

        setGeocodeSuggestions(results.slice(0, 8));

        if (results.length === 0) {
          setGeocodeStatus("error");
        }
      } catch {
        if (seq === geocodeSeqRef.current) {
          setGeocodeSuggestions([]);
          setGeocodeStatus("error");
        }
      } finally {
        if (seq === geocodeSeqRef.current) {
          setGeocoding(false);
        }
      }
    },
    [isValidCoord, watchedLat, watchedLng],
  );

  const handlePickSuggestion = useCallback(
    (suggestion: GeocodeResult) => {
      const lat = Number(Number(suggestion.lat).toFixed(7));
      const lng = Number(Number(suggestion.lng).toFixed(7));

      // Debug: log raw suggestion and normalized coords
      console.log("geocode:pick", { suggestion, lat, lng });

      setGeocodeSuggestions([]);
      setGeocoding(false);
      setValue(
        "address",
        suggestion.display?.trim() || suggestion.address?.trim() || "",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );

      setLastPicked({ lat, lng });

      if (!isValidCoord(lat, lng)) {
        console.warn("handlePickSuggestion: invalid coords", {
          lat,
          lng,
          suggestion,
        });
        setGeocodeStatus("error");
        return;
      }

      commitCoordinates(lat, lng);
    },
    [commitCoordinates, setValue, isValidCoord],
  );

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    // forward to react-hook-form's register onChange
    register("address").onChange(e);

    const val = e.target.value;
    setGeocodeSuggestions([]);
    setGeocodeStatus("idle");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => geocodeAddress(val), 900);
  }

  return (
    <section className="onboarding-card">
      <h2>Địa chỉ &amp; vị trí</h2>

      <label>
        <span>Địa chỉ quán *</span>
        <div style={{ position: "relative" }}>
          <input
            placeholder="Ví dụ: 12 Nguyễn Trãi, Quận 1, TP.HCM"
            {...register("address")}
            onChange={handleAddressChange}
          />
          {geocoding && (
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                color: "#888",
              }}
            >
              ⏳ Đang tìm...
            </span>
          )}
          {geocodeSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "calc(100% + 8px)",
                zIndex: 30,
                border: "1px solid #dbe4f0",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  borderBottom: "1px solid #eef2f7",
                }}
              >
                Chọn một gợi ý bên dưới
              </div>
              {geocodeSuggestions.map((item) => (
                <button
                  key={`${item.lat}-${item.lng}-${item.display}`}
                  type="button"
                  onClick={() => handlePickSuggestion(item)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: 0,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}
                  >
                    {item.display || item.address}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {item.address}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.address && <small>{errors.address.message}</small>}
        {geocodeStatus === "ok" && !geocoding && (
          <small style={{ color: "#22c55e" }}>
            ✓ Đã xác định được vị trí trên bản đồ
          </small>
        )}
        {geocodeStatus === "error" && !geocoding && (
          <small style={{ color: "#ef4444" }}>
            ⚠ Không tìm được vị trí, bạn có thể click thẳng trên bản đồ để chọn
          </small>
        )}
        {geocodeStatus === "ok" && !geocoding && (
          <small style={{ color: "#2563eb" }}>
            📍 Vị trí đã được chọn trên bản đồ
          </small>
        )}
      </label>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          style={{
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#111827",
            borderRadius: 999,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 600,
            cursor: locating ? "wait" : "pointer",
          }}
        >
          {locating ? "Đang lấy vị trí..." : "Lấy vị trí hiện tại"}
        </button>
        {geocodeStatus === "ok" && (
          <span
            style={{
              alignSelf: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#2563eb",
            }}
          >
            Đã ghim vị trí hiện tại
          </span>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: 320,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          marginTop: 8,
        }}
      />
      {lastPicked && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: lastPicked.lat && lastPicked.lng ? "#2563eb" : "#ef4444",
          }}
        >
          <strong>Debug toạ độ:</strong> {lastPicked.lat ?? "-"},{" "}
          {lastPicked.lng ?? "-"}
          {(!lastPicked.lat || !lastPicked.lng) && " — Toạ độ không hợp lệ"}
        </div>
      )}
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
        💡 Nhập địa chỉ để tự động định vị, hoặc click trực tiếp trên bản đồ để
        chọn vị trí chính xác
      </p>

      <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
      <input
        type="hidden"
        {...register("longitude", { valueAsNumber: true })}
      />

      {(errors.latitude || errors.longitude) && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            backgroundColor: "#fee2e2",
            borderRadius: 8,
            color: "#b91c1c",
            fontSize: 12,
          }}
        >
          ⚠️{" "}
          {errors.latitude?.message ||
            errors.longitude?.message ||
            "Vui lòng chọn vị trí trên bản đồ"}
        </div>
      )}
    </section>
  );
}
