import { api } from "@/lib/axios";
import type { Merchant, MerchantDetail } from "../types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PageResult<T> = {
  items: T[];
  totalItems: number;
  pageSize: number;
  pageIndex: number;
};

type MerchantListResponse = Merchant[] | PageResult<Merchant>;
type MerchantListApiPayload =
  | MerchantListResponse
  | ApiResponse<MerchantListResponse>;
type MerchantRecord = Record<string, unknown>;

function unwrapApiData<T>(payload: T | ApiResponse<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload.data;
  }

  return payload as T;
}

function unwrapMerchantList(payload: MerchantListApiPayload) {
  const data = unwrapApiData(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null && "items" in data) {
    return data.items ?? [];
  }

  return [];
}

function extractDescriptionField(description: string | undefined, label: string) {
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

function calculateDistanceKm(
  userLat: number,
  userLng: number,
  merchantLat: number,
  merchantLng: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRad(merchantLat - userLat);
  const dLng = toRad(merchantLng - userLng);
  const lat1 = toRad(userLat);
  const lat2 = toRad(merchantLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * radiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function attachClientDistance(
  merchant: Merchant,
  latitude: number,
  longitude: number,
): Merchant {
  const coords = getMerchantCoords(merchant);
  if (!coords) return merchant;

  return {
    ...merchant,
    distance: calculateDistanceKm(
      latitude,
      longitude,
      coords.lat,
      coords.lng,
    ),
  };
}

function merchantMatchesKeyword(merchant: Merchant, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;

  return [
    merchant.name,
    merchant.description,
    merchant.address,
    merchant.menu?.map((item) => `${item.name} ${item.description ?? ""}`).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalizedKeyword);
}

function mergeMerchantData(
  summary: Merchant,
  detail?: MerchantDetail | null,
): Merchant {
  const description = detail?.description || summary.description;

  return {
    ...detail,
    ...summary,
    address:
      detail?.address ||
      summary.address ||
      extractDescriptionField(description, "Địa chỉ"),
    description,
    email: detail?.email || summary.email,
    phone: detail?.phone || summary.phone,
    logoUrl: detail?.logoUrl || summary.logoUrl,
    menu: detail?.menu ?? summary.menu,
    latitude: summary.latitude ?? detail?.latitude,
    longitude: summary.longitude ?? detail?.longitude,
    lat: summary.lat ?? detail?.lat,
    lng: summary.lng ?? detail?.lng,
    rating: summary.rating ?? detail?.rating,
    distance: summary.distance ?? detail?.distance,
  };
}

async function getMerchantDetailSafe(id: string) {
  try {
    return await getMerchantDetail(id);
  } catch {
    return null;
  }
}

export async function getNearbyMerchants(params: {
  latitude: number;
  longitude: number;
  keyword?: string;
}) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchants",
    params: {
      SearchTerm: params.keyword,
      PageIndex: 1,
      PageSize: 100,
      Latitude: params.latitude,
      Longitude: params.longitude,
    },
  });

  const summaries = unwrapMerchantList(res.data);
  const summaryById = new Map(summaries.map((item) => [item.id, item]));
  const ids = Array.from(summaryById.keys()).filter(Boolean);

  const details = await Promise.all(ids.map((id) => getMerchantDetailSafe(id)));
  const detailById = new Map(
    details
      .filter((item): item is MerchantDetail => item !== null)
      .map((item) => [item.id, item]),
  );

  return ids
    .map((id) =>
      mergeMerchantData(
        summaryById.get(id)!,
        detailById.get(id),
      ),
    )
    .filter((merchant) => merchantMatchesKeyword(merchant, params.keyword ?? ""))
    .map((merchant) =>
      attachClientDistance(merchant, params.latitude, params.longitude),
    )
    .sort((a, b) => {
      const distanceA =
        typeof a.distance === "number" && Number.isFinite(a.distance)
          ? a.distance
          : Number.POSITIVE_INFINITY;
      const distanceB =
        typeof b.distance === "number" && Number.isFinite(b.distance)
          ? b.distance
          : Number.POSITIVE_INFINITY;

      return distanceA - distanceB;
    });
}

export async function getMerchantDetail(id: string): Promise<MerchantDetail> {
  const res = await api.get<ApiResponse<MerchantDetail> | MerchantDetail>(
    `/merchants/${id}`,
  );

  const merchant = unwrapApiData(res.data);

  return {
    ...merchant,
    foods: merchant.foods ?? merchant.menu ?? [],
    menu: merchant.menu ?? merchant.foods ?? [],
  };
}

/**
 * Use the merchant map endpoint from the backend contract.
 */
export async function getMapMerchants(payload: unknown) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchants/map",
    params: payload,
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantsByCategory(payload: unknown) {
  const res = await api.request<MerchantListApiPayload>({
    method: "get",
    url: "/merchants/by-category",
    params: payload,
  });

  return unwrapMerchantList(res.data);
}

export async function getMerchantMe() {
  throw new Error(
    "Backend contract hiện tại chưa public endpoint lấy merchant hiện tại.",
  );
}
