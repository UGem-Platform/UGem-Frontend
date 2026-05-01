import { useCallback, useEffect, useMemo, useState } from "react";
import { Map as MapIcon, Navigation, X, Clock, Route } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

import MerchantCard from "../components/MerchantCard";
import NearbyMerchantsMap from "../components/NearbyMerchantsMap.tsx";
import { getNearbyMerchants } from "../services/merchantService";
import type { Merchant } from "../types";
import { useVietMapRoute } from "@/shared/hooks/useVietMapRoute";
import {
  metersToKm,
  secondsToText,
  HAS_VIETMAP_KEY,
  HAS_VIETMAP_SERVICE_KEY,
} from "@/shared/services/vietmapService";

type Coords = { latitude: number; longitude: number };

const DEFAULT_COORDS: Coords = {
  latitude: 10.762622,
  longitude: 106.660172,
};

function resolveLocation(): Promise<{ coords: Coords; usedDefault: boolean }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ coords: DEFAULT_COORDS, usedDefault: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          usedDefault: false,
        });
      },
      () => {
        resolve({ coords: DEFAULT_COORDS, usedDefault: true });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  });
}

/** Lấy tọa độ của merchant */
function getMerchantCoords(
  merchant: Merchant,
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

export default function CustomerHomePage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  const [showMap, setShowMap] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(
    null,
  );

  // ── Route state ──────────────────────────────────────────────
  const {
    route,
    clearRoute,
    routeResult,
    loading: routeLoading,
  } = useVietMapRoute();

  const selectedMerchant = useMemo(
    () => merchants.find((m) => m.id === selectedMerchantId) ?? null,
    [merchants, selectedMerchantId],
  );

  const merchantCountText = useMemo(() => {
    if (loading) return "Đang tải";
    return `${merchants.length} quán`;
  }, [loading, merchants.length]);

  const loadMerchants = useCallback(
    async (searchKeyword: string, coordsToUse: Coords) => {
      setLoading(true);

      try {
        const data = await getNearbyMerchants({
          latitude: coordsToUse.latitude,
          longitude: coordsToUse.longitude,
          keyword: searchKeyword,
        });

        setMerchants(data);
        setSelectedMerchantId((prev) =>
          prev && data.some((m) => m.id === prev) ? prev : null,
        );
      } catch (error) {
        console.error(error);
        alert("Không tải được danh sách quán.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const result = await resolveLocation();
      setCoords(result.coords);

      if (result.usedDefault) {
        setLocationError("Không lấy được vị trí, đang dùng vị trí mặc định.");
      } else {
        setLocationError("");
      }

      await loadMerchants("", result.coords);
    })();
  }, [loadMerchants]);

  // ── Tự động tính route khi chọn quán ─────────────────────────
  useEffect(() => {
    if (!selectedMerchantId || !selectedMerchant) {
      clearRoute();
      return;
    }

    const merchantCoords = getMerchantCoords(selectedMerchant);
    if (!merchantCoords) return;

    route(
      { lat: coords.latitude, lng: coords.longitude },
      { lat: merchantCoords.lat, lng: merchantCoords.lng },
      "bike",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMerchantId]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadMerchants(keyword, coords);
  }

  function handleSelectMerchantId(id: string) {
    setSelectedMerchantId((prev) => (prev === id ? null : id));

    const el = document.getElementById(`merchant-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleClearRoute() {
    setSelectedMerchantId(null);
    clearRoute();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">UGem</h1>
            <p className="text-sm text-muted-foreground">
              Khám phá các quán ăn gần bạn
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMap((v) => !v)}
            aria-pressed={showMap}
            className="gap-2"
          >
            <MapIcon />
            {showMap ? "Ẩn bản đồ" : "Bản đồ"}
          </Button>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm quán, món ăn..."
            className="h-11"
          />
          <Button type="submit" className="h-11" disabled={loading}>
            Tìm
          </Button>
        </form>

        {locationError && (
          <Card className="mb-4">
            <CardContent className="py-3 text-sm text-muted-foreground">
              {locationError}
            </CardContent>
          </Card>
        )}

        <div className={cn("grid gap-4", showMap ? "lg:grid-cols-12" : "")}>
          <div className={cn(showMap ? "lg:col-span-7" : "lg:col-span-12")}>
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">Quán gần bạn</CardTitle>
                  <CardDescription>{merchantCountText}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                ) : merchants.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Chưa có quán nào gần bạn.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {merchants.map((merchant) => (
                      <div
                        key={merchant.id}
                        id={`merchant-${merchant.id}`}
                        className={cn(
                          "rounded-lg transition-all",
                          selectedMerchantId === merchant.id
                            ? "ring-2 ring-ring"
                            : "",
                        )}
                      >
                        <MerchantCard merchant={merchant} />

                        {/* Nút xem đường đi */}
                        {showMap && (
                          <div className="px-4 pb-3">
                            <Button
                              size="sm"
                              variant={
                                selectedMerchantId === merchant.id
                                  ? "default"
                                  : "outline"
                              }
                              className="gap-1.5 text-xs"
                              onClick={() =>
                                handleSelectMerchantId(merchant.id)
                              }
                              disabled={
                                routeLoading &&
                                selectedMerchantId === merchant.id
                              }
                            >
                              {routeLoading &&
                              selectedMerchantId === merchant.id ? (
                                <>
                                  <span className="animate-spin">⏳</span>
                                  Đang tính...
                                </>
                              ) : selectedMerchantId === merchant.id ? (
                                <>
                                  <X className="h-3 w-3" />
                                  Bỏ chọn
                                </>
                              ) : (
                                <>
                                  <Navigation className="h-3 w-3" />
                                  Xem đường đi
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {showMap && (
            <div className="lg:col-span-5">
              <Card className="overflow-hidden lg:sticky lg:top-6">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">Bản đồ</CardTitle>
                      <CardDescription>
                        {selectedMerchant
                          ? `Đang xem: ${selectedMerchant.name}`
                          : "Click vào quán để xem đường đi"}
                      </CardDescription>
                    </div>

                    {selectedMerchantId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClearRoute}
                        className="gap-1 text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        Xoá
                      </Button>
                    )}
                  </div>

                  {/* Route info card */}
                  {routeResult && (
                    <div className="mt-2 flex gap-3 rounded-xl bg-cyan-50 px-4 py-3 dark:bg-cyan-950/50">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                        <Route className="h-4 w-4" />
                        {metersToKm(routeResult.distance)}
                      </div>
                      <div className="h-4 w-px bg-cyan-200 dark:bg-cyan-700" />
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                        <Clock className="h-4 w-4" />
                        {secondsToText(routeResult.duration)}
                      </div>
                      {!HAS_VIETMAP_KEY && (
                        <span className="ml-auto text-xs text-amber-600">
                          ⚠️ Cần API key để tính route
                        </span>
                      )}
                    </div>
                  )}

                  {!HAS_VIETMAP_SERVICE_KEY && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      💡 Thêm{" "}
                      <code className="font-mono bg-muted px-1 rounded">
                        VITE_VIETMAP_SERVICE_KEY
                      </code>{" "}
                      vào{" "}
                      <code className="font-mono bg-muted px-1 rounded">
                        .env
                      </code>{" "}
                      để tính đường đi bằng VietMap
                    </p>
                  )}
                  {!HAS_VIETMAP_KEY && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      💡 Thêm{" "}
                      <code className="font-mono bg-muted px-1 rounded">
                        VITE_VIETMAP_API_KEY
                      </code>{" "}
                      vào{" "}
                      <code className="font-mono bg-muted px-1 rounded">
                        .env
                      </code>{" "}
                      để hiển thị bản đồ VietMap
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  <div className="h-105 w-full lg:h-[calc(100vh-320px)]">
                    <NearbyMerchantsMap
                      center={coords}
                      merchants={merchants}
                      selectedMerchantId={selectedMerchantId}
                      onSelectMerchantId={handleSelectMerchantId}
                      routeCoordinates={routeResult?.coordinates}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
