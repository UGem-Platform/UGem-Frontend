/**
 * VietMapGL – React wrapper sử dụng MapLibre GL JS
 * với VietMap style tiles
 *
 * Tính năng:
 *  1. Hiển thị bản đồ VietMap
 *  2. Ghim markers (quán ăn, trạm sạc, user location…)
 *  3. Popup khi click marker
 *  4. Vẽ route / đường đi từ tọa độ
 */
import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  VIETMAP_STYLE_URL,
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
  className = "h-full w-full",
}: Readonly<VietMapGLProps>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerMapRef = useRef<
    Map<string, { marker: maplibregl.Marker; popup: maplibregl.Popup }>
  >(new Map());
  const routeReadyRef = useRef(false);

  // ── 1. Khởi tạo map một lần ──────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: VIETMAP_STYLE_URL,
      center: [centerLng, centerLat],
      zoom,
      attributionControl: { compact: true },
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

    map.addControl(new maplibregl.NavigationControl({}), "top-right");

    mapRef.current = map;
    const markersById = markerMapRef.current;

    return () => {
      markersById.forEach(({ marker }) => marker.remove());
      markersById.clear();
      map.remove();
      mapRef.current = null;
      routeReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Di chuyển khi center thay đổi ─────────────────────
  useEffect(() => {
    mapRef.current?.easeTo({
      center: [centerLng, centerLat],
      duration: 600,
    });
  }, [centerLng, centerLat]);

  // ── 3. Cập nhật markers ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderMarkers = () => {
      // Xoá markers cũ
      markerMapRef.current.forEach(({ marker }) => marker.remove());
      markerMapRef.current.clear();

      for (const m of markers) {
        const el = createMarkerElement(m.type, m.color);

        const popup = new maplibregl.Popup({
          offset: m.type === "user" ? 14 : 32,
          closeButton: true,
          closeOnClick: false,
          maxWidth: "260px",
        }).setHTML(
          m.popupHtml ??
            `<div style="font-weight:600;font-size:13px;padding:2px 4px">${m.id}</div>`,
        );

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(map);

        el.addEventListener("click", () => {
          onMarkerClick?.(m.id);
        });

        markerMapRef.current.set(m.id, { marker, popup });
      }
    };

    if (map.loaded()) {
      renderMarkers();
    } else {
      map.once("load", renderMarkers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  // ── 4. Mở popup & fly to marker được chọn ────────────────
  useEffect(() => {
    markerMapRef.current.forEach(({ marker, popup }, id) => {
      if (id === selectedMarkerId) {
        const map = mapRef.current;
        if (map) {
          popup.addTo(map);
          const { lng, lat } = marker.getLngLat();
          map.flyTo({ center: [lng, lat], zoom: 16, duration: 700 });
        }
      } else {
        popup.remove();
      }
    });
  }, [selectedMarkerId]);

  // ── 5. Vẽ / xoá route ────────────────────────────────────
  const applyRoute = useCallback(
    (map: maplibregl.Map, coords: [number, number][]) => {
      const validCoords = coords.filter(
        (pair): pair is [number, number] =>
          Array.isArray(pair) &&
          pair.length === 2 &&
          typeof pair[0] === "number" &&
          Number.isFinite(pair[0]) &&
          typeof pair[1] === "number" &&
          Number.isFinite(pair[1]),
      );

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
          "line-width": 9,
          "line-opacity": 0.6,
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
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });

      // Fit bounds
      const bounds = validCoords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(validCoords[0], validCoords[0]),
      );
      map.fitBounds(bounds, { padding: 70, duration: 900 });
      routeReadyRef.current = true;
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

  return <div ref={containerRef} className={className} />;
}
