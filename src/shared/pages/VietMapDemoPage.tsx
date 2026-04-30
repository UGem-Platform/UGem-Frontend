/**
 * VietMapDemoPage – Trang demo tất cả tính năng VietMap
 *
 * Bao gồm:
 *  1. Bản đồ VietMap GL
 *  2. Ghim markers (quán ăn + trạm sạc)
 *  3. Geocode: nhập địa chỉ → lấy tọa độ
 *  4. Route: vẽ đường đi giữa 2 điểm
 */
import { useState, useCallback } from "react";
import VietMapGL, { type MapMarker } from "@/shared/components/VietMapGL";
import { useVietMapRoute } from "@/shared/hooks/useVietMapRoute";
import { metersToKm, secondsToText, type LngLat } from "@/shared/services/vietmapService";

// ─── Dữ liệu mẫu ────────────────────────────────────────────

const SAMPLE_RESTAURANTS: MapMarker[] = [
  {
    id: "r1",
    lat: 10.7769,
    lng: 106.7009,
    type: "restaurant",
    popupHtml: `<div><strong>🍜 Phở Hòa Pasteur</strong><br/><small>260C Pasteur, Q.3</small></div>`,
  },
  {
    id: "r2",
    lat: 10.7731,
    lng: 106.6982,
    type: "restaurant",
    popupHtml: `<div><strong>🍚 Cơm Tấm Thuận Kiều</strong><br/><small>135 Bùi Thị Xuân, Q.1</small></div>`,
  },
  {
    id: "r3",
    lat: 10.7795,
    lng: 106.6954,
    type: "restaurant",
    popupHtml: `<div><strong>🧋 Trà Sữa The Alley</strong><br/><small>14 Tôn Thất Thiệp, Q.1</small></div>`,
  },
];

const SAMPLE_CHARGING: MapMarker[] = [
  {
    id: "c1",
    lat: 10.7662,
    lng: 106.6880,
    type: "charging",
    popupHtml: `<div><strong>⚡ Trạm Sạc VinFast Q.1</strong><br/><small>Gara tầng B2, 72 Lê Thánh Tôn</small><br/><span style="color:#16a34a">● Còn trống 4 cổng</span></div>`,
  },
  {
    id: "c2",
    lat: 10.7751,
    lng: 106.7103,
    type: "charging",
    popupHtml: `<div><strong>⚡ Trạm Sạc VinFast Q.Bình Thạnh</strong><br/><small>Gara Vincom Đồng Khởi</small><br/><span style="color:#dc2626">● Đang bận (0 cổng)</span></div>`,
  },
];

// ─── Component ───────────────────────────────────────────────

type Tab = "markers" | "geocode" | "route";

export default function VietMapDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("markers");

  // Map state
  const [visibleRestaurants, setVisibleRestaurants] = useState(true);
  const [visibleCharging, setVisibleCharging] = useState(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | undefined>();

  // Geocode state
  const [searchText, setSearchText] = useState("");

  // Route state
  const [originText, setOriginText] = useState("");
  const [destText, setDestText] = useState("");
  const [originCoord, setOriginCoord] = useState<LngLat | null>(null);
  const [destCoord, setDestCoord] = useState<LngLat | null>(null);

  const { geocode, route, routeResult, geocodeResults, loading, error, clearRoute } =
    useVietMapRoute();

  // ── Markers tổng hợp ──
  const allMarkers: MapMarker[] = [
    ...(visibleRestaurants ? SAMPLE_RESTAURANTS : []),
    ...(visibleCharging ? SAMPLE_CHARGING : []),
    // Thêm điểm origin/dest nếu đã geocode
    ...(originCoord
      ? [
          {
            id: "__origin__",
            lat: originCoord.lat,
            lng: originCoord.lng,
            type: "user" as const,
            popupHtml: `<div><strong>Điểm xuất phát</strong></div>`,
          },
        ]
      : []),
    ...(destCoord
      ? [
          {
            id: "__dest__",
            lat: destCoord.lat,
            lng: destCoord.lng,
            type: "custom" as const,
            color: "#ef4444",
            popupHtml: `<div><strong>Điểm đến</strong></div>`,
          },
        ]
      : []),
  ];

  // ── Geocode handler ──
  const handleGeocode = useCallback(async () => {
    await geocode(searchText);
  }, [geocode, searchText]);

  // ── Route handler ──
  const handleRoute = useCallback(async () => {
    if (!originCoord || !destCoord) return;
    const result = await route(originCoord, destCoord, "car");
    if (result) setRouteCoords(result.coordinates);
  }, [route, originCoord, destCoord]);

  const handleGeocodeForOrigin = useCallback(async () => {
    const results = await geocode(originText);
    if (results[0]) {
      setOriginCoord({ lat: results[0].lat, lng: results[0].lng });
    }
  }, [geocode, originText]);

  const handleGeocodeForDest = useCallback(async () => {
    const results = await geocode(destText);
    if (results[0]) {
      setDestCoord({ lat: results[0].lat, lng: results[0].lng });
    }
  }, [geocode, destText]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🗺️</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">VietMap Demo</h1>
          <p className="text-sm text-gray-500">
            Bản đồ · Markers · Geocode · Route
          </p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-72px)]">
        {/* ── Sidebar ── */}
        <div className="w-80 bg-white border-r flex flex-col overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b">
            {(
              [
                { key: "markers", label: "📍 Markers" },
                { key: "geocode", label: "🔍 Geocode" },
                { key: "route", label: "🛣️ Route" },
              ] as { key: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === t.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* ─ Tab: Markers ─ */}
            {activeTab === "markers" && (
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-800">Hiển thị trên bản đồ</h2>

                {/* Toggle restaurants */}
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={visibleRestaurants}
                    onChange={(e) => setVisibleRestaurants(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-2xl">🍜</span>
                  <div>
                    <div className="font-medium text-sm">Quán ăn</div>
                    <div className="text-xs text-gray-500">{SAMPLE_RESTAURANTS.length} địa điểm</div>
                  </div>
                </label>

                {/* Toggle charging */}
                <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={visibleCharging}
                    onChange={(e) => setVisibleCharging(e.target.checked)}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-medium text-sm">Trạm sạc xe</div>
                    <div className="text-xs text-gray-500">{SAMPLE_CHARGING.length} trạm</div>
                  </div>
                </label>

                {/* Marker list */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Click để zoom đến địa điểm:</p>
                  {allMarkers
                    .filter((m) => !m.id.startsWith("__"))
                    .map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMarkerId(m.id)}
                        className={`w-full text-left p-2 rounded-md text-sm mb-1 transition-colors ${
                          selectedMarkerId === m.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {m.type === "restaurant" ? "🍜" : "⚡"} {m.id.toUpperCase()}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* ─ Tab: Geocode ─ */}
            {activeTab === "geocode" && (
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-800">
                  Chuyển địa chỉ → Tọa độ
                </h2>
                <p className="text-xs text-gray-500">
                  Nhập địa chỉ bất kỳ để VietMap trả về kinh độ, vĩ độ.
                </p>

                <div className="flex gap-2">
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGeocode()}
                    placeholder="VD: 260 Pasteur, Quận 3"
                    className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleGeocode}
                    disabled={loading || !searchText.trim()}
                    className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    Tìm
                  </button>
                </div>

                {loading && (
                  <p className="text-xs text-blue-500">Đang tìm kiếm…</p>
                )}
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                {geocodeResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">
                      Kết quả ({geocodeResults.length}):
                    </p>
                    {geocodeResults.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 rounded-lg border text-sm"
                      >
                        <div className="font-medium text-gray-800">{r.display || r.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          📌 {r.lat.toFixed(6)}, {r.lng.toFixed(6)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─ Tab: Route ─ */}
            {activeTab === "route" && (
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-800">
                  Tính đường đi
                </h2>
                <p className="text-xs text-gray-500">
                  Nhập 2 địa chỉ để VietMap tính đường đi ngắn nhất.
                </p>

                {/* Origin */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    🟢 Điểm xuất phát
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={originText}
                      onChange={(e) => setOriginText(e.target.value)}
                      placeholder="VD: Bến Thành, Q.1"
                      className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={handleGeocodeForOrigin}
                      disabled={loading || !originText.trim()}
                      className="bg-green-600 text-white px-2 py-2 rounded-md text-xs disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>
                  {originCoord && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {originCoord.lat.toFixed(5)}, {originCoord.lng.toFixed(5)}
                    </p>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    🔴 Điểm đến
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={destText}
                      onChange={(e) => setDestText(e.target.value)}
                      placeholder="VD: Sân bay Tân Sơn Nhất"
                      className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={handleGeocodeForDest}
                      disabled={loading || !destText.trim()}
                      className="bg-red-500 text-white px-2 py-2 rounded-md text-xs disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>
                  {destCoord && (
                    <p className="text-xs text-red-500 mt-1">
                      ✓ {destCoord.lat.toFixed(5)}, {destCoord.lng.toFixed(5)}
                    </p>
                  )}
                </div>

                {/* Calculate */}
                <button
                  onClick={handleRoute}
                  disabled={loading || !originCoord || !destCoord}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  {loading ? "Đang tính…" : "🛣️ Tính đường đi"}
                </button>

                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                {/* Route result */}
                {routeResult && (
                  <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-900">Kết quả</span>
                      <button
                        onClick={() => { clearRoute(); setRouteCoords(undefined); }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ✕ Xoá
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {metersToKm(routeResult.distance)}
                        </div>
                        <div className="text-xs text-gray-500">Khoảng cách</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {secondsToText(routeResult.duration)}
                        </div>
                        <div className="text-xs text-gray-500">Thời gian</div>
                      </div>
                    </div>

                    {routeResult.steps.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          Hướng dẫn đường đi:
                        </p>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {routeResult.steps.map((step, i) => (
                            <div
                              key={i}
                              className="flex gap-2 text-xs text-gray-700"
                            >
                              <span className="text-blue-400 shrink-0">
                                {i + 1}.
                              </span>
                              <span>{step.instruction}</span>
                              <span className="text-gray-400 shrink-0 ml-auto">
                                {metersToKm(step.distance)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Map ── */}
        <div className="flex-1 relative">
          <VietMapGL
            centerLng={106.6942}
            centerLat={10.7736}
            zoom={13}
            markers={allMarkers}
            selectedMarkerId={selectedMarkerId}
            onMarkerClick={(id) => {
              if (!id.startsWith("__")) setSelectedMarkerId(id);
            }}
            routeCoordinates={routeCoords}
            routeColor="#3b82f6"
            className="h-full w-full"
          />

          {/* Map legend */}
          <div className="absolute bottom-6 left-4 bg-white rounded-xl shadow-lg p-3 text-xs space-y-1.5 border">
            <p className="font-semibold text-gray-700 mb-2">Chú thích</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
              <span>Vị trí của bạn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow" />
              <span>Quán ăn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
              <span>Trạm sạc</span>
            </div>
            {routeCoords && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded-full bg-blue-600" />
                <span>Đường đi</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
