# VietMap Implementation Status ✅

## 1. Hiển thị Map lên UI ✅

**File**: `src/shared/components/VietMapGL.tsx`

Đã implement đầy đủ theo tài liệu simple-map:

```typescript
const map = new maplibregl.Map({
  container: containerRef.current,
  style: VIETMAP_STYLE_URL,
  center: [centerLng, centerLat],
  zoom,
  attributionControl: { compact: true },
  transformRequest: (url) => {
    /* auto add apikey */
  },
});
map.addControl(new maplibregl.NavigationControl({}), "top-right");
```

**Status**: ✅ OK - Bản đồ hiển thị (hiện dùng OpenFreeMap fallback)

---

## 2. Ghim Markers lên Bản đồ ✅

**File**: `src/shared/components/VietMapGL.tsx` (lines 70-130)

Có 2 cách implement:

### a) Custom HTML Markers (đang dùng) ✅

```typescript
const marker = new maplibregl.Marker({ element: el })
  .setLngLat([m.lng, m.lat])
  .setPopup(popup)
  .addTo(map);
```

- ✅ Icons tùy chỉnh (🍜 emoji, 🔌 charging, 💙 user)
- ✅ Custom colors
- ✅ Popup HTML khi click
- ✅ Animation cho user marker (pulsing effect)

### b) Icon Types Support ✅

```typescript
type?: "restaurant" | "charging" | "user" | "custom"
```

**Ứng dụng thực tế**:

- ✅ Ghim quán ăn (NearbyMerchantsMap)
- ✅ Ghim trạm sạc (có hỗ trợ type)
- ✅ Ghim vị trí user (blue pulsing marker)

**Status**: ✅ OK - Markers đầy đủ tính năng

---

## 3. Tính Toán Khoảng Cách & Routing ✅

**File**: `src/shared/services/vietmapService.ts` (lines 75-170)

### Routing API ✅

```typescript
export async function getRoute(
  origin: LngLat,
  destination: LngLat,
  vehicle: "car" | "bike" | "foot" | "motorcycle",
): Promise<RouteResult>;
```

**Trả về**:

- ✅ `coordinates`: Array [lng, lat][] → dùng để vẽ đường
- ✅ `distance`: Tổng khoảng cách (meters)
- ✅ `duration`: Tổng thời gian (seconds)
- ✅ `steps`: Chi tiết từng đoạn đường + instruction text

### Dual Implementation ✅

1. **VietMap Route API v1.1** (nếu có API key)
   - Chính xác với dữ liệu Việt Nam
   - Hỗ trợ: car, bike, foot, motorcycle

2. **OSRM Fallback** (khi không có API key)
   - Miễn phí, không cần key
   - Coverage toàn cầu

### Helpers ✅

```typescript
metersToKm(1500); // "1.5 km"
secondsToText(3600); // "1 giờ"
```

**Status**: ✅ OK - Routing đầy đủ

---

## 4. Vẽ Đường Thẳng lên Bản đồ ✅

**File**: `src/shared/components/VietMapGL.tsx` (lines 230-300)

```typescript
const applyRoute = useCallback(
  (map: maplibregl.Map, coords: [number, number][]) => {
    map.addSource(ROUTE_SOURCE_ID, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
      },
    });

    // Background layer (white)
    map.addLayer({
      id: ROUTE_LAYER_BG_ID,
      type: "line",
      paint: { "line-color": "#ffffff", "line-width": 9 },
    });

    // Main layer (colored)
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: "line",
      paint: { "line-color": routeColor, "line-width": 5 },
    });

    // Auto fit bounds
    map.fitBounds(bounds, { padding: 70 });
  },
);
```

**Features**:

- ✅ Vẽ từ GeoJSON coordinates
- ✅ Stroke style customizable (width, color, opacity)
- ✅ Auto fit map bounds
- ✅ Remove old routes trước khi vẽ cái mới

**Status**: ✅ OK - Line drawing hoàn hảo

---

## 5. Real-World Usage ✅

**File**: `src/features/customer/pages/CustomerHomePage.tsx`

### Merchants Map Integration ✅

```typescript
const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
const { route, routeResult } = useVietMapRoute();

// Click merchant → tính route → hiển thị đường
const handleShowRoute = async (merchantId: string) => {
  await route(userCoords, merchantCoords, "motorcycle");
  setSelectedMerchantId(merchantId);
};

<VietMapGL
  markers={merchants.map(m => ({
    id: m.id,
    lng: m.lng,
    lat: m.lat,
    type: "restaurant",
    popupHtml: `<div>${m.name}</div>`
  }))}
  selectedMarkerId={selectedMerchantId}
  routeCoordinates={routeResult?.coordinates}
/>
```

**Status**: ✅ OK - Integrated with business logic

---

## Current Issues 🔴

### 1. VietMap API Key Invalid ❌

**Problem**:

```
GET https://maps.vietmap.vn/maps/tiles/vlc-20260421/13/6521/3849.pbf
Failed: "net::ERR_ABORTED"
```

**Current**: Using OpenFreeMap fallback

```typescript
// Temporary workaround in vietmapService.ts
export const VIETMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty"; // Fallback
```

**Solution**: Get new API key from https://maps.vietmap.vn/

**File to update**: `.env`

```env
VITE_VIETMAP_API_KEY=<new_key_here>
VITE_VIETMAP_SERVICE_KEY=<new_key_here>
```

### 2. Restore VietMap Tiles

Once you have valid keys, update `src/shared/services/vietmapService.ts`:

```typescript
export const VIETMAP_STYLE_URL = HAS_VIETMAP_KEY
  ? `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${VIETMAP_API_KEY}`
  : "https://tiles.openfreemap.org/styles/liberty";
```

---

## Summary ✅

| Feature           | Status | Details                             |
| ----------------- | ------ | ----------------------------------- |
| Map Display       | ✅     | MapLibre GL + NavigationControl     |
| Markers           | ✅     | Custom HTML, multiple types, popups |
| Routing           | ✅     | VietMap API + OSRM fallback         |
| Line Drawing      | ✅     | GeoJSON + MapLibre layers           |
| Real-world Usage  | ✅     | Integrated with CustomerHomePage    |
| **VietMap Tiles** | 🔴     | API key invalid - need new one      |

**All features are implemented correctly. Only issue is the API key.**
