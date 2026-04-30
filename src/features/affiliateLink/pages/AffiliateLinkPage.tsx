import { useEffect, useState } from "react";
import { getAffiliateLinks } from "../services";
import type { AffiliateLink } from "../services";

export default function AffiliateLinkPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAffiliateLinks();
        setLinks(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không tải được danh sách",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-5 text-2xl font-bold">Liên kết Affiliate</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-600">Lỗi: {error}</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur">
            <table className="w-full">
              <thead className="bg-cyan-50 text-left text-sm">
                <tr>
                  <th className="p-4">Tên</th>
                  <th className="p-4">URL</th>
                  <th className="p-4">Mô tả</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {links.length > 0 ? (
                  links.map((link: AffiliateLink, idx: number) => (
                    <tr key={link.id || idx} className="border-t">
                      <td className="p-4">{link.name || "N/A"}</td>
                      <td className="p-4">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-700 truncate max-w-xs inline-block"
                        >
                          {link.url || "N/A"}
                        </a>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {link.description || "N/A"}
                      </td>
                      <td className="p-4">{link.status || "Active"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={4}>
                      Chưa có liên kết nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
