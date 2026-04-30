import { useEffect, useState } from "react";
import MerchantCard from "../components/MerchantCard";
import { getNearbyMerchants } from "../services/merchantService";
import type { Merchant } from "../types";

export default function CustomerHomePage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  async function loadMerchants(searchKeyword = "") {
    setLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await getNearbyMerchants({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            keyword: searchKeyword,
          });

          setMerchants(data);
        } catch (error) {
          console.error(error);
          alert("Không tải được danh sách quán.");
        } finally {
          setLoading(false);
        }
      },
      async () => {
        try {
          setLocationError("Không lấy được vị trí, đang dùng vị trí mặc định.");

          const data = await getNearbyMerchants({
            latitude: 10.762622,
            longitude: 106.660172,
            keyword: searchKeyword,
          });

          setMerchants(data);
        } catch (error) {
          console.error(error);
          alert("Không tải được danh sách quán.");
        } finally {
          setLoading(false);
        }
      },
    );
  }

  useEffect(() => {
    loadMerchants();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadMerchants(keyword);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">UGem</h1>
          <p className="text-sm text-gray-500">Khám phá các quán ăn gần bạn</p>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm quán, món ăn..."
            className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />
          <button className="rounded-xl bg-blue-600 px-5 py-3 text-white">
            Tìm
          </button>
        </form>

        {locationError && (
          <p className="mb-3 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            {locationError}
          </p>
        )}

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}

            {merchants.length === 0 && (
              <p className="text-center text-gray-500">
                Chưa có quán nào gần bạn.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
