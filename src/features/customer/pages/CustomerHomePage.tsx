import { useCallback, useEffect, useMemo, useState } from "react";
import { Map as MapIcon, Navigation, X, Clock, Route } from "lucide-react";
import { notify } from "@/shared/lib/notify";

import { cn } from "@/lib/utils";
import { UserAccountMenu } from "@/shared/components";
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
  type GeocodeResult,
  metersToKm,
  secondsToText,
  searchGeocodeAddress,
} from "@/shared/services/vietmapService";

type Coords = { latitude: number; longitude: number };
type LocationResult = {
  coords: Coords;
  usedDefault: boolean;
  accuracy?: number;
  errorCode?: number;
  errorMessage?: string;
};
type MerchantRecord = Record<string, unknown>;
type LocationMode = "browser" | "manual" | "default";

const DEFAULT_COORDS: Coords = {
  latitude: 10.762622,
  longitude: 106.660172,
};

const LOCATION_SAMPLE_TIMEOUT_MS = 10_000;

function resolveLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ coords: DEFAULT_COORDS, usedDefault: true });
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let settled = false;
    let watchId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastError: GeolocationPositionError | null = null;

    const finish = (fallbackToDefault = false) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (timeoutId) clearTimeout(timeoutId);

      if (fallbackToDefault || !bestPosition) {
        resolve({
          coords: DEFAULT_COORDS,
          usedDefault: true,
          errorCode: lastError?.code,
          errorMessage: lastError?.message,
        });
        return;
      }

      // Accept position even if accuracy is poor - just mark it as inaccurate
      console.debug(
        "[resolveLocation] Accepted position (even if not ideal):",
        `lat=${bestPosition.coords.latitude.toFixed(6)}, lng=${bestPosition.coords.longitude.toFixed(6)}, accuracy=${Math.round(bestPosition.coords.accuracy)}m`,
      );

      resolve({
        coords: {
          latitude: bestPosition.coords.latitude,
          longitude: bestPosition.coords.longitude,
        },
        usedDefault: false,
        accuracy: bestPosition.coords.accuracy,
      });
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (
          !bestPosition ||
          position.coords.accuracy < bestPosition.coords.accuracy
        ) {
          bestPosition = position;
        }

        finish();
      },
      (error) => {
        lastError = error;
        finish(bestPosition === null);
      },
      {
        enableHighAccuracy: true,
        timeout: LOCATION_SAMPLE_TIMEOUT_MS,
        maximumAge: 0,
      },
    );

    timeoutId = setTimeout(
      () => finish(bestPosition === null),
      LOCATION_SAMPLE_TIMEOUT_MS,
    );

    // Debug log
    console.debug(
      "[resolveLocation] Started watching position with timeout:",
      LOCATION_SAMPLE_TIMEOUT_MS,
      "ms",
    );
  });
}

/** Lấy tọa độ của merchant */
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

function getLocationErrorMessage(result: LocationResult) {
  if (result.errorCode === 1) {
    return "Không lấy được vị trí hiện tại vì trình duyệt đang chặn quyền Location. Hãy Allow Location rồi reload trang.";
  }

  if (result.errorCode === 2) {
    return "Thiết bị chưa trả được vị trí hiện tại. Hãy bật GPS/Location Services rồi thử lại.";
  }

  if (result.errorCode === 3) {
    return "Lấy vị trí hiện tại bị timeout. Hãy bật GPS/Location Services hoặc thử lại sau vài giây.";
  }

  return "Không lấy được vị trí hiện tại. Hãy kiểm tra quyền Location.";
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

function distanceKm(a: Coords, b: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRad(b.lat - a.latitude);
  const dLng = toRad(b.lng - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * radiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function isGeocodedDistanceReasonable(
  userCoords: Coords,
  merchant: Merchant,
  candidate: { lat: number; lng: number },
) {
  if (
    typeof merchant.distance !== "number" ||
    !Number.isFinite(merchant.distance)
  ) {
    return true;
  }

  const actualDistance = distanceKm(userCoords, candidate);
  const expectedDistance = Math.max(merchant.distance, 0);
  const toleranceKm = Math.max(1.5, expectedDistance * 2 + 0.5);
  return Math.abs(actualDistance - expectedDistance) <= toleranceKm;
}

async function searchOriginSuggestions(
  text: string,
  coords: Coords,
  size: number,
) {
  return searchGeocodeAddress(text, {
    proximity: { lat: coords.latitude, lng: coords.longitude },
    size,
  });
}

export default function CustomerHomePage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [hasCustomerLocation, setHasCustomerLocation] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>("default");
  const [originInput, setOriginInput] = useState("");
  const [appliedOriginInput, setAppliedOriginInput] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState<GeocodeResult[]>(
    [],
  );
  const [originSuggestionsOpen, setOriginSuggestionsOpen] = useState(false);
  const [originSuggesting, setOriginSuggesting] = useState(false);
  const [originResolving, setOriginResolving] = useState(false);
  const [geocodeCandidates, setGeocodeCandidates] = useState<GeocodeResult[]>(
    [],
  );
  const [locatingCustomer, setLocatingCustomer] = useState(false);
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  // Candidate location (from geolocation) pending user confirmation
  const [candidateLocation, setCandidateLocation] = useState<Coords | null>(
    null,
  );
  const [candidateAccuracy, setCandidateAccuracy] = useState<number | null>(
    null,
  );
  const [showMap, setShowMap] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(
    null,
  );
  const [routeLoadingMerchantId, setRouteLoadingMerchantId] = useState<
    string | null
  >(null);
  const [routeDestinationCoords, setRouteDestinationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ── Route state ──────────────────────────────────────────────
  const { route, clearRoute, routeResult } = useVietMapRoute();

  const selectedMerchant = useMemo(
    () => merchants.find((m) => m.id === selectedMerchantId) ?? null,
    [merchants, selectedMerchantId],
  );
  const selectedMerchantCoords = useMemo(
    () => (selectedMerchant ? getMerchantCoords(selectedMerchant) : null),
    [selectedMerchant],
  );
  const visibleDestinationCoords =
    selectedMerchantCoords ?? routeDestinationCoords;

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
        notify.error("Không tải được danh sách quán.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const applyCustomerOrigin = useCallback(
    async (
      nextCoords: Coords,
      source: LocationMode,
      accuracy?: number | null,
    ) => {
      setCoords(nextCoords);
      setHasCustomerLocation(source !== "default");
      setLocationMode(source);
      setLocationAccuracy(
        typeof accuracy === "number" ? Math.round(accuracy) : null,
      );
      await loadMerchants(keyword, nextCoords);
    },
    [keyword, loadMerchants],
  );

  useEffect(() => {
    const text = originInput.trim();
    let active = true;

    const timeoutId = setTimeout(async () => {
      if (text.length < 3 || text === appliedOriginInput.trim()) {
        setOriginSuggestions([]);
        setOriginSuggestionsOpen(false);
        setOriginSuggesting(false);
        return;
      }

      setOriginSuggesting(true);

      try {
        const results = await searchOriginSuggestions(text, coords, 6);

        if (!active) return;

        setOriginSuggestions(results);
        setOriginSuggestionsOpen(true);
      } catch (error) {
        console.error(error);

        if (active) {
          setOriginSuggestions([]);
          setOriginSuggestionsOpen(true);
        }
      } finally {
        if (active) {
          setOriginSuggesting(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [appliedOriginInput, coords, originInput]);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const result = await resolveLocation();
      if (cancelled) return;

      setOriginInput("");
      setAppliedOriginInput("");
      setOriginSuggestions([]);
      setOriginSuggestionsOpen(false);
      setCoords(result.coords);
      setHasCustomerLocation(!result.usedDefault);
      setLocationMode(result.usedDefault ? "default" : "browser");
      setLocationAccuracy(
        typeof result.accuracy === "number"
          ? Math.round(result.accuracy)
          : null,
      );

      if (result.usedDefault) {
        setLocationError(getLocationErrorMessage(result));
      } else if (result.accuracy && result.accuracy > 150) {
        setLocationError(
          `Vị trí hiện tại chưa thật chính xác (~${Math.round(
            result.accuracy,
          )}m). Nếu thấy sai, hãy bật GPS/Location Services rồi tải lại trang.`,
        );
      } else {
        setLocationError("");
      }

      await loadMerchants("", result.coords);
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [loadMerchants]);

  // ── Tự động tính route khi chọn quán ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function calculateRoute() {
      if (!selectedMerchantId || !selectedMerchant) {
        clearRoute();
        setRouteDestinationCoords(null);
        setRouteLoadingMerchantId(null);
        return;
      }

      clearRoute();
      setRouteDestinationCoords(null);
      setRouteLoadingMerchantId(selectedMerchant.id);

      if (!hasCustomerLocation) {
        setRouteLoadingMerchantId(null);
        notify.error(
          "Hãy bật quyền vị trí để tính đường đi từ chỗ bạn đang đứng.",
        );
        return;
      }

      let merchantCoords = getMerchantCoords(selectedMerchant);

      if (!merchantCoords && selectedMerchant.address?.trim()) {
        try {
          const results = await searchGeocodeAddress(selectedMerchant.address, {
            proximity: { lat: coords.latitude, lng: coords.longitude },
            size: 5,
          });
          const candidates = results
            .map((item) => ({ lat: item.lat, lng: item.lng }))
            .filter(
              (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng),
            );
          const candidate =
            candidates.find((item) =>
              isGeocodedDistanceReasonable(
                {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                },
                selectedMerchant,
                item,
              ),
            ) ?? candidates[0];

          if (candidate) {
            merchantCoords = candidate;
          }
        } catch (error) {
          console.error(error);
        }
      }

      if (cancelled) return;

      if (!merchantCoords) {
        clearRoute();
        setRouteDestinationCoords(null);
        setRouteLoadingMerchantId(null);
        notify.error("Quán này chưa có tọa độ chính xác để vẽ đường đi.");
        return;
      }

      setRouteDestinationCoords(merchantCoords);
      const result = await route(
        { lng: coords.longitude, lat: coords.latitude },
        { lng: merchantCoords.lng, lat: merchantCoords.lat },
        "motorcycle",
      );

      if (!cancelled && !result) {
        notify.error("Không vẽ được đường đi đến quán này.");
      }
      if (!cancelled) {
        setRouteLoadingMerchantId(null);
      }
    }

    void calculateRoute();

    return () => {
      cancelled = true;
    };
  }, [
    clearRoute,
    coords.latitude,
    coords.longitude,
    hasCustomerLocation,
    route,
    selectedMerchant,
    selectedMerchantId,
  ]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadMerchants(keyword, coords);
  }

  async function handleRefreshCustomerLocation() {
    console.debug("[handleRefreshCustomerLocation] START");

    if (!navigator.geolocation) {
      console.error("[handleRefreshCustomerLocation] ❌ No geolocation API");
      notify.error("Trình duyệt không hỗ trợ lấy vị trí hiện tại.");
      return;
    }

    console.debug("[handleRefreshCustomerLocation] Geolocation API available");
    setLocatingCustomer(true);

    try {
      console.debug(
        "[handleRefreshCustomerLocation] Calling resolveLocation()...",
      );
      const result = await resolveLocation();
      console.debug(
        "[handleRefreshCustomerLocation] resolveLocation completed:",
        {
          usedDefault: result.usedDefault,
          lat: result.coords.latitude,
          lng: result.coords.longitude,
          accuracy: result.accuracy,
        },
      );

      if (result.usedDefault) {
        notify.error(getLocationErrorMessage(result));
        return;
      }

      // Instead of applying immediately, set as candidate for user confirmation
      console.debug(
        "[handleRefreshCustomerLocation] ✅ Got location, setting candidate for confirmation...",
      );
      setCandidateLocation({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });
      setCandidateAccuracy(
        typeof result.accuracy === "number"
          ? Math.round(result.accuracy)
          : null,
      );
      setOriginInput("");
      setAppliedOriginInput("");
      setOriginSuggestions([]);
      setOriginSuggestionsOpen(false);
      setLocationError("");
      await applyCustomerOrigin(result.coords, "browser", result.accuracy);
    } finally {
      console.debug(
        "[handleRefreshCustomerLocation] END (locatingCustomer = false)",
      );
      setLocatingCustomer(false);
    }
  }

  async function applyOriginSuggestion(suggestion: GeocodeResult) {
    const label = suggestion.display || suggestion.address || suggestion.name;

    setOriginInput(label);
    setAppliedOriginInput(label);
    setOriginSuggestions([]);
    setOriginSuggestionsOpen(false);
    setOriginResolving(true);

    try {
      setLocationError("");
      await applyCustomerOrigin(
        {
          latitude: suggestion.lat,
          longitude: suggestion.lng,
        },
        "manual",
        null,
      );
      setCandidateLocation(null);
      setCandidateAccuracy(null);
      setGeocodeCandidates([]);
      notify.success("Đã đặt vị trí xuất phát.");
    } finally {
      setOriginResolving(false);
    }
  }

  async function handleSelectGeocodeCandidate(candidate: GeocodeResult) {
    setGeocodeCandidates([]);
    await applyOriginSuggestion(candidate);
  }

  async function handleOriginSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = originInput.trim();
    if (!text) return;

    setOriginResolving(true);
    try {
      const results = await searchOriginSuggestions(text, coords, 5);
      const first = results[0];
      if (!first) {
        notify.error("Không tìm được vị trí bạn nhập.");
        return;
      }

      setOriginInput(first.display || first.address || first.name);
      setAppliedOriginInput(first.display || first.address || first.name);
      setOriginSuggestions([]);
      setOriginSuggestionsOpen(false);
      setLocationError("");
      await applyCustomerOrigin(
        { latitude: first.lat, longitude: first.lng },
        "manual",
        null,
      );
      setGeocodeCandidates([]);
      setCandidateLocation(null);
      setCandidateAccuracy(null);
      notify.success("Đã đặt vị trí xuất phát.");
    } catch (e) {
      console.error(e);
      notify.error("Không thể đặt vị trí từ gợi ý");
    } finally {
      setOriginResolving(false);
    }
  }

  async function handleConfirmCandidate() {
    if (!candidateLocation) return;
    setLocatingCustomer(true);
    try {
      await applyCustomerOrigin(
        candidateLocation,
        "browser",
        candidateAccuracy ?? null,
      );
      setCandidateLocation(null);
      setCandidateAccuracy(null);
      setLocationError("");
      notify.success("Đã xác nhận vị trí của bạn.");
    } catch (e) {
      console.error(e);
      notify.error("Không thể xác nhận vị trí.");
    } finally {
      setLocatingCustomer(false);
    }
  }

  function handleCancelCandidate() {
    setCandidateLocation(null);
    setCandidateAccuracy(null);
    setLocationError("⚠️ Vui lòng nhập địa chỉ của bạn để tìm quán gần nhất.");
  }

  function handleCandidateDrag(lat: number, lng: number) {
    setCandidateLocation({ latitude: lat, longitude: lng });
    setCandidateAccuracy(null);
  }

  function handleSelectMerchantId(id: string) {
    setSelectedMerchantId((prev) => (prev === id ? null : id));

    const el = document.getElementById(`merchant-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleClearRoute() {
    setSelectedMerchantId(null);
    setRouteDestinationCoords(null);
    clearRoute();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">UGem</h1>
            <p className="text-sm text-muted-foreground">
              Khám phá các quán ăn gần bạn
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <UserAccountMenu fallbackName="Customer" />
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
          <Card className="mb-4 border-orange-200 bg-orange-50">
            <CardContent className="py-4 text-sm text-orange-800 font-medium">
              {locationError}
            </CardContent>
          </Card>
        )}

        <div className={cn("grid gap-4", showMap ? "lg:grid-cols-12" : "")}>
          <div className={cn(showMap ? "lg:col-span-6" : "lg:col-span-12")}>
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
                                routeLoadingMerchantId === merchant.id &&
                                selectedMerchantId === merchant.id
                              }
                            >
                              {routeLoadingMerchantId === merchant.id &&
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
            <div className="lg:col-span-6">
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

                  <form
                    onSubmit={handleOriginSubmit}
                    className="mt-3 flex flex-col gap-2 sm:flex-row"
                  >
                    <div className="relative flex-1">
                      <Input
                        value={originInput}
                        onChange={(e) => {
                          setOriginInput(e.target.value);
                          setAppliedOriginInput("");
                          setOriginSuggestionsOpen(true);
                        }}
                        placeholder="Nhập vị trí của bạn, VD: BS10B Vinhomes Grand Park"
                        onFocus={() => {
                          if (originInput.trim().length >= 3) {
                            setOriginSuggestionsOpen(true);
                          }
                        }}
                        onBlur={() => {
                          window.setTimeout(
                            () => setOriginSuggestionsOpen(false),
                            120,
                          );
                        }}
                        className="h-9 text-xs"
                        autoComplete="off"
                      />
                      {originSuggestionsOpen &&
                        originInput.trim().length >= 3 && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-cyan-100 bg-white py-1 text-sm shadow-lg">
                            {originSuggesting ? (
                              <div className="px-3 py-2 text-xs text-slate-500">
                                Đang tìm gợi ý...
                              </div>
                            ) : originSuggestions.length > 0 ? (
                              originSuggestions.map((suggestion) => (
                                <button
                                  key={`${suggestion.ref_id}-${suggestion.lat}-${suggestion.lng}`}
                                  type="button"
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() =>
                                    void applyOriginSuggestion(suggestion)
                                  }
                                  className="block w-full px-3 py-2 text-left hover:bg-cyan-50"
                                >
                                  <span className="block truncate font-medium text-slate-800">
                                    {suggestion.name || suggestion.display}
                                  </span>
                                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                                    {suggestion.address || suggestion.display}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-xs text-slate-500">
                                Không có gợi ý phù hợp.
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={originResolving || !originInput.trim()}
                        className="h-9 whitespace-nowrap text-xs"
                      >
                        {originResolving ? "Đang tìm..." : "Đặt vị trí"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRefreshCustomerLocation}
                        disabled={locatingCustomer}
                        className="h-9 gap-1.5 whitespace-nowrap text-xs"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        {locatingCustomer ? "Đang lấy..." : "Hiện tại"}
                      </Button>
                    </div>
                  </form>

                  {/* Geocode candidates (proximity-biased) */}
                  {geocodeCandidates.length > 0 && (
                    <div className="mt-2">
                      <Card className="border">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm">
                                Gợi ý địa điểm
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Chọn vị trí đúng nhất với ý bạn
                              </CardDescription>
                            </div>
                            <div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setGeocodeCandidates([])}
                              >
                                Đóng
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-2">
                          <ul className="space-y-1">
                            {geocodeCandidates.map((c) => {
                              const distM = Math.round(
                                distanceKm(
                                  {
                                    latitude:
                                      candidateLocation?.latitude ??
                                      coords.latitude,
                                    longitude:
                                      candidateLocation?.longitude ??
                                      coords.longitude,
                                  },
                                  { lat: c.lat, lng: c.lng },
                                ) * 1000,
                              );
                              return (
                                <li
                                  key={c.ref_id}
                                  className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-50"
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {c.display || c.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {c.address} • ~{distM}m
                                    </div>
                                  </div>
                                  <div className="ml-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleSelectGeocodeCandidate(c)
                                      }
                                    >
                                      Chọn
                                    </Button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Candidate confirmation UI */}
                  {candidateLocation && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 rounded-md border p-3 text-sm bg-white">
                        <div className="font-semibold">Vị trí đề xuất</div>
                        <div className="text-xs text-slate-500">
                          {candidateLocation.latitude.toFixed(6)},{" "}
                          {candidateLocation.longitude.toFixed(6)}{" "}
                          {candidateAccuracy ? `(±${candidateAccuracy}m)` : ""}
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          Kéo chấm trên bản đồ để điều chỉnh vị trí, sau đó bấm
                          "Xác nhận vị trí".
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleConfirmCandidate}
                          className="h-9"
                        >
                          Xác nhận vị trí
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelCandidate}
                          className="h-9"
                        >
                          Huỷ
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Route info card */}
                  {routeResult && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-cyan-50 px-4 py-3 dark:bg-cyan-950/50">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                        <Route className="h-4 w-4" />
                        {metersToKm(routeResult.distance)}
                      </div>
                      <div className="h-4 w-px bg-cyan-200 dark:bg-cyan-700" />
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                        <Clock className="h-4 w-4" />
                        {secondsToText(routeResult.duration)}
                      </div>
                    </div>
                  )}

                  {routeResult && (routeResult.steps?.length ?? 0) > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
                      <div className="mb-2 font-semibold text-slate-800">
                        Hướng dẫn đường đi
                      </div>

                      <ol className="space-y-2">
                        {routeResult.steps!.map((step, index) => (
                          <li
                            key={`${step.instruction}-${index}`}
                            className="flex gap-2"
                          >
                            <span className="font-semibold text-cyan-600">
                              {index + 1}.
                            </span>
                            <span>
                              {step.instruction}
                              <span className="ml-1 text-xs text-slate-500">
                                ({metersToKm(step.distance)})
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="mt-2 grid gap-1 rounded-xl bg-slate-50 px-4 py-2 text-[11px] font-medium text-slate-500">
                    <span>
                      Bạn:{" "}
                      {hasCustomerLocation
                        ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}${
                            locationAccuracy !== null
                              ? ` (±${locationAccuracy}m)`
                              : ""
                          }${locationMode === "manual" ? " (nhập tay)" : ""}`
                        : "chưa lấy được vị trí hiện tại"}
                    </span>
                    {selectedMerchant && (
                      <span>
                        Quán:{" "}
                        {visibleDestinationCoords
                          ? `${visibleDestinationCoords.lat.toFixed(6)}, ${visibleDestinationCoords.lng.toFixed(6)}${
                              selectedMerchantCoords ? "" : " (geocode)"
                            }`
                          : "chưa có tọa độ từ BE, FE sẽ thử lấy theo địa chỉ"}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="h-130 w-full lg:h-[calc(100vh-190px)] lg:min-h-155">
                    <div className="relative h-full w-full">
                      <NearbyMerchantsMap
                        center={candidateLocation ?? coords}
                        merchants={merchants}
                        selectedMerchantId={selectedMerchantId}
                        onSelectMerchantId={handleSelectMerchantId}
                        routeCoordinates={routeResult?.coordinates}
                        onLocateCustomer={handleRefreshCustomerLocation}
                        locateLoading={locatingCustomer}
                        editableUserMarker={!!candidateLocation}
                        onUserMarkerDrag={handleCandidateDrag}
                      />
                    </div>
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
