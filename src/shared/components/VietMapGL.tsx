/**
 * VietMapGL – React wrapper sử dụng VietMap GL JS
 *
 * Tính năng:
 *  1. Hiển thị bản đồ VietMap
 *  2. Ghim markers (quán ăn, trạm sạc, user location…)
 *  3. Popup khi click marker
 *  4. Vẽ route / đường đi từ tọa độ
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { Navigation } from "lucide-react";
import * as vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import {
  getVietmapStyleUrl,
  HAS_VIETMAP_KEY,
  VIETMAP_API_KEY,
} from "@/shared/services/vietmapService";

// ─── Types ────────────────────────────────────────────────────

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  /** HTML nội dung popup khi click */
  popupHtml?: string;
  /** Loại marker để chọn icon/màu */
  type?: "restaurant" | "charging" | "user" | "custom";
  /** Màu tuỳ chọn (override type color) */
  color?: string;
  /** Allow marker to be draggable (for user confirmation) */
  draggable?: boolean;
}

export interface VietMapGLProps {
  /** Kinh độ tâm bản đồ (default: TP.HCM) */
  centerLng?: number;
  /** Vĩ độ tâm bản đồ */
  centerLat?: number;
  /** Zoom level (1–20) */
  zoom?: number;
  /** Danh sách markers cần ghim */
  markers?: MapMarker[];
  /** ID marker đang được chọn (sẽ mở popup + fly to) */
  selectedMarkerId?: string | null;
  /** Callback khi người dùng click một marker */
  onMarkerClick?: (id: string) => void;
  /** Mảng tọa độ [lng, lat][] để vẽ route */
  routeCoordinates?: [number, number][];
  /** Màu đường route */
  routeColor?: string;
  fitToMarkers?: boolean;
  onLocateClick?: () => void;
  locateLoading?: boolean;
  editableUserMarker?: boolean;
  onUserMarkerDrag?: (lng: number, lat: number) => void;
  /** Class CSS cho container */
  className?: string;
}

// ─── Marker Element Builder ───────────────────────────────────

const MARKER_COLORS: Record<string, string> = {
  restaurant: "#f97316",
  charging: "#22c55e",
  user: "#3b82f6",
  custom: "#8b5cf6",
};

const MARKER_ICONS: Record<string, string> = {
  restaurant: "🍜",
  charging: "⚡",
  custom: "📍",
};

function createMarkerElement(
  type: MapMarker["type"],
  color?: string,
): HTMLElement {
  const el = document.createElement("div");
  const bg = color ?? MARKER_COLORS[type ?? "custom"] ?? "#8b5cf6";

  if (type === "user") {
    el.innerHTML = `
      <div style="
        position:relative;
        width:20px;height:20px;
      ">
        <div style="
          width:20px;height:20px;
          background:${bg};
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 0 0 4px ${bg}55;
          animation:vmUserPulse 2s ease-in-out infinite;
        "></div>
      </div>
      <style>
        @keyframes vmUserPulse {
          0%,100%{box-shadow:0 0 0 4px ${bg}55}
          50%{box-shadow:0 0 0 10px ${bg}22}
        }
      </style>
    `;
  } else {
    const icon = MARKER_ICONS[type ?? "custom"] ?? "📍";
    el.innerHTML = `
      <div style="
        position:relative;
        width:36px;height:42px;
        cursor:pointer;
      ">
        <div style="
          width:36px;height:36px;
          background:${bg};
          border:2.5px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 3px 10px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          transition:transform 0.15s ease;
        ">
          <span style="transform:rotate(45deg);font-size:15px;line-height:1">
            ${icon}
          </span>
        </div>
        <div style="
          position:absolute;bottom:0;left:50%;
          transform:translateX(-50%);
          width:6px;height:6px;
          background:${bg};
          border-radius:50%;
          opacity:0.6;
        "></div>
      </div>
    `;
  }
  el.style.cursor = "pointer";
  return el;
}

// ─── Constants ───────────────────────────────────────────────

const ROUTE_SOURCE_ID = "vm-route-source";
const ROUTE_LAYER_ID = "vm-route-layer";
const ROUTE_LAYER_BG_ID = "vm-route-layer-bg";

function isValidLngLat(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isLngInRange(value: number) {
  return value >= -180 && value <= 180;
}

function isLatInRange(value: number) {
  return value >= -90 && value <= 90;
}

function normalizeCenter(value: unknown, fallback: number): number {
  return isValidLngLat(value) ? value : fallback;
}

function isValidRoutePoint(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isValidLngLat(value[0]) &&
    isValidLngLat(value[1]) &&
    isLngInRange(value[0]) &&
    isLatInRange(value[1])
  );
}

// ─── Component ───────────────────────────────────────────────

export default function VietMapGL({
  centerLng = 106.660172,
  centerLat = 10.762622,
  zoom = 13,
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  routeCoordinates,
  routeColor = "#3b82f6",
  fitToMarkers = false,
  onLocateClick,
  locateLoading = false,
  onUserMarkerDrag,
  className = "h-full w-full",
  styleName = "tm",
}: Readonly<VietMapGLProps & { styleName?: string }>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const markerMapRef = useRef<
    Map<string, { marker: vietmapgl.Marker; popup: vietmapgl.Popup }>
  >(new Map());
  const routeReadyRef = useRef(false);
  const routeFitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [routeOverlayPath, setRouteOverlayPath] = useState<string | null>(null);
  const userMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const [internalLocating, setInternalLocating] = useState(false);

  // ── 1. Khởi tạo map một lần ──────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !HAS_VIETMAP_KEY) return;

    const map = new vietmapgl.Map({
      container: containerRef.current,
      style: getVietmapStyleUrl(styleName),
      center: [
        normalizeCenter(centerLng, 106.660172),
        normalizeCenter(centerLat, 10.762622),
      ],
      zoom,
      pitch: 20, // 3D tilt for better visuals
      bearing: 0, // Rotation (0 = north up)
      attributionControl: { compact: true },
      // transitionDuration is not present in some type defs; keep it for runtime
      // @ts-expect-error - transitionDuration not declared in type defs but supported at runtime
      transitionDuration: 500,
      transformRequest: (url) => {
        // Tự động thêm apikey vào các request gọi đến vietmap.vn (để lấy tile, font, sprite...)
        if (HAS_VIETMAP_KEY && url.includes("vietmap.vn")) {
          // Tránh thêm trùng apikey
          if (!url.includes("apikey=")) {
            const separator = url.includes("?") ? "&" : "?";
            return { url: `${url}${separator}apikey=${VIETMAP_API_KEY}` };
          }
        }
        return { url };
      },
    });

    map.addControl(new vietmapgl.NavigationControl({}), "top-right");

    mapRef.current = map;
    const markersById = markerMapRef.current;

    return () => {
      markersById.forEach(({ marker }) => marker.remove());
      markersById.clear();
      if (routeFitTimerRef.current) {
        clearTimeout(routeFitTimerRef.current);
        routeFitTimerRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      routeReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Cập nhật style khi styleName thay đổi ──────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      console.debug("[VietMapGL] Map not ready, skipping style update");
      return;
    }

    console.debug(
      `[VietMapGL] Changing style to: ${styleName}, map.loaded()=${map.loaded()}`,
    );

    const updateStyle = () => {
      const styleUrl = getVietmapStyleUrl(styleName);
      console.debug("[VietMapGL] Style URL:", styleUrl);
      try {
        map.setStyle(styleUrl);
        console.debug("[VietMapGL] Style change requested successfully");
      } catch (e) {
        console.warn("[VietMapGL] Failed to change map style:", e);
      }
    };

    // Nếu map chưa loaded, đợi load event
    if (!map.loaded()) {
      console.debug("[VietMapGL] Map not loaded yet, waiting for 'load' event");
      map.once("load", updateStyle);
    } else {
      console.debug(
        "[VietMapGL] Map already loaded, updating style immediately",
      );
      updateStyle();
    }
  }, [styleName]);

  // ── 3. Di chuyển khi center thay đổi ─────────────────────
  useEffect(() => {
    mapRef.current?.easeTo({
      center: [centerLng, centerLat],
      duration: 600,
    });
  }, [centerLng, centerLat]);

  // ── 4. Cập nhật markers ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderMarkers = () => {
      // Xoá markers cũ
      markerMapRef.current.forEach(({ marker }) => marker.remove());
      markerMapRef.current.clear();
      const visibleCoords: [number, number][] = [];

      for (const m of markers) {
        if (!isValidLngLat(m.lng) || !isValidLngLat(m.lat)) continue;
        visibleCoords.push([m.lng, m.lat]);

        const el = createMarkerElement(m.type, m.color);

        const popup = new vietmapgl.Popup({
          offset: m.type === "user" ? 14 : 32,
          closeButton: true,
          closeOnClick: false,
          maxWidth: "260px",
        }).setHTML(
          m.popupHtml ??
            `<div style="font-weight:600;font-size:13px;padding:2px 4px">${m.id}</div>`,
        );

        const marker = new vietmapgl.Marker({
          element: el,
          draggable: !!m.draggable,
        })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);

        if (m.draggable) {
          marker.on("dragend", () => {
            try {
              const p = marker.getLngLat();
              onUserMarkerDrag?.(p.lng, p.lat);
            } catch (e) {
              console.warn("User marker dragend handler failed", e);
            }
          });
        }

        el.addEventListener("click", () => {
          onMarkerClick?.(m.id);
        });

        markerMapRef.current.set(m.id, { marker, popup });
      }

      if (
        fitToMarkers &&
        visibleCoords.length > 0 &&
        (!routeCoordinates || routeCoordinates.length < 2)
      ) {
        if (visibleCoords.length === 1) {
          map.easeTo({
            center: visibleCoords[0],
            zoom: Math.max(map.getZoom(), 14),
            duration: 700,
          });
          return;
        }

        try {
          const bounds = visibleCoords.reduce(
            (b, c) => b.extend(c),
            new vietmapgl.LngLatBounds(visibleCoords[0], visibleCoords[0]),
          );
          map.fitBounds(bounds, {
            padding: { top: 72, right: 64, bottom: 72, left: 64 },
            maxZoom: 15,
            duration: 800,
          });
        } catch (error) {
          console.warn("Could not fit marker bounds:", error);
        }
      }
    };

    if (map.loaded()) {
      renderMarkers();
    } else {
      map.once("load", renderMarkers);
    }
  }, [
    fitToMarkers,
    markers,
    onMarkerClick,
    routeCoordinates,
    onUserMarkerDrag,
  ]);

  // ── 5. Mở popup & fly to marker được chọn ────────────────
  useEffect(() => {
    const hasRoute = (routeCoordinates?.length ?? 0) >= 2;

    markerMapRef.current.forEach(({ marker, popup }, id) => {
      if (id === selectedMarkerId) {
        const map = mapRef.current;
        if (map) {
          popup.addTo(map);
          if (!hasRoute) {
            const { lng, lat } = marker.getLngLat();
            map.flyTo({ center: [lng, lat], zoom: 16, duration: 700 });
          }
        }
      } else {
        popup.remove();
      }
    });
  }, [routeCoordinates, selectedMarkerId]);

  // ── 6. Vẽ / xoá route ────────────────────────────────────
  const applyRoute = useCallback(
    (map: vietmapgl.Map, coords: [number, number][]) => {
      const validCoords = coords.filter(isValidRoutePoint);

      // Xoá route cũ
      if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
      if (map.getLayer(ROUTE_LAYER_BG_ID)) map.removeLayer(ROUTE_LAYER_BG_ID);
      if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);

      if (validCoords.length < 2) {
        routeReadyRef.current = false;
        return;
      }

      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: validCoords },
        },
      });

      // Viền trắng phía sau
      map.addLayer({
        id: ROUTE_LAYER_BG_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 13,
          "line-opacity": 0.85,
        },
      });

      // Đường chính
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": routeColor,
          "line-width": 7,
          "line-opacity": 1,
        },
      });

      // Fit bounds
      try {
        const bounds = validCoords.reduce(
          (b, c) => b.extend(c),
          new vietmapgl.LngLatBounds(validCoords[0], validCoords[0]),
        );
        map.stop();
        map.fitBounds(bounds, {
          padding: { top: 120, right: 90, bottom: 120, left: 90 },
          maxZoom: 15,
          duration: 900,
        });
        if (routeFitTimerRef.current) {
          clearTimeout(routeFitTimerRef.current);
        }
        routeFitTimerRef.current = setTimeout(() => {
          map.fitBounds(bounds, {
            padding: { top: 120, right: 90, bottom: 120, left: 90 },
            maxZoom: 15,
            duration: 0,
          });
        }, 950);
        routeReadyRef.current = true;
      } catch (e) {
        console.warn("Could not fit route bounds:", e);
      }
    },
    [routeColor],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = () => applyRoute(map, routeCoordinates ?? []);

    if (map.loaded()) {
      run();
    } else {
      map.once("load", run);
    }
  }, [routeCoordinates, applyRoute]);

  const updateRouteOverlay = useCallback(() => {
    const map = mapRef.current;
    const validCoords = (routeCoordinates ?? []).filter(isValidRoutePoint);

    if (!map || validCoords.length < 2) {
      setRouteOverlayPath(null);
      return;
    }

    const path = validCoords
      .map((coord, index) => {
        const point = map.project(coord);
        return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      })
      .join(" ");

    setRouteOverlayPath(path || null);
  }, [routeCoordinates]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    updateRouteOverlay();
    map.on("move", updateRouteOverlay);
    map.on("resize", updateRouteOverlay);

    return () => {
      map.off("move", updateRouteOverlay);
      map.off("resize", updateRouteOverlay);
    };
  }, [routeCoordinates, updateRouteOverlay]);

  const handleLocateClick = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    // Prefer parent-controlled locate flow: if parent provided an onLocateClick
    // handler, delegate geolocation and state updates to parent to avoid
    // duplicate markers and inconsistent state.
    if (onLocateClick) {
      onLocateClick();
      return;
    }

    // If no parent handler, fall back to internal geolocation behaviour.
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      setInternalLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            map.easeTo({
              center: [lng, lat],
              zoom: Math.max(map.getZoom(), 16),
              duration: 600,
            });

            const el = createMarkerElement("user", undefined);
            if (userMarkerRef.current) {
              userMarkerRef.current.setLngLat([lng, lat]);
            } else {
              const popup = new vietmapgl.Popup({
                offset: 14,
                closeButton: false,
                closeOnClick: false,
                maxWidth: "240px",
              }).setHTML(`<div style="font-weight:600">Vị trí của bạn</div>`);

              userMarkerRef.current = new vietmapgl.Marker({ element: el })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map);
            }
          } finally {
            setInternalLocating(false);
          }
        },
        () => {
          map.easeTo({
            center: [centerLng, centerLat],
            zoom: Math.max(map.getZoom(), 16),
            duration: 600,
          });
          setInternalLocating(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
      );
      return;
    }

    // Fallback: just move to provided center
    map.easeTo({
      center: [centerLng, centerLat],
      zoom: Math.max(map.getZoom(), 16),
      duration: 600,
    });
  }, [centerLat, centerLng, onLocateClick]);

  return (
    <div ref={containerRef} className={`${className} relative`}>
      {routeOverlayPath && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 h-full w-full"
        >
          <path
            d={routeOverlayPath}
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.95"
            strokeWidth="13"
          />
          <path
            d={routeOverlayPath}
            fill="none"
            stroke={routeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="7"
          />
        </svg>
      )}
      {onLocateClick && (
        <button
          type="button"
          aria-label="Lấy vị trí hiện tại"
          title="Lấy vị trí hiện tại"
          onClick={handleLocateClick}
          disabled={locateLoading || internalLocating}
          className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-lg transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
        >
          <Navigation
            className={`h-5 w-5 ${locateLoading || internalLocating ? "animate-pulse" : ""}`}
          />
        </button>
      )}
      {!HAS_VIETMAP_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 px-4 text-center text-sm font-semibold text-slate-500">
          Chưa cấu hình VietMap API key
        </div>
      )}
    </div>
  );
}
