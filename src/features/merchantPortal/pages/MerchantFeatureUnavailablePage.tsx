import { AlertCircle } from "lucide-react";

import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";

type MerchantFeatureUnavailablePageProps = {
  title: string;
  description: string;
  missingApis: string[];
};

function MerchantFeatureUnavailablePage({
  title,
  description,
  missingApis,
}: MerchantFeatureUnavailablePageProps) {
  return (
    <main className="merchant-portal-layout">
      <MerchantSidebar />

      <section className="merchant-main">
        <MerchantHeader />

        <div className="merchant-content">
          <section className="rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle size={22} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                  Chưa có API backend
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-950">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">BE hiện chưa public các endpoint:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {missingApis.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export function MerchantCampaignPage() {
  return (
    <MerchantFeatureUnavailablePage
      title="Campaign"
      description="Trong backend hiện tại chưa có CampaignController, service campaign, hoặc entity campaign. FE chỉ có thể mở trang này để báo trạng thái contract."
      missingApis={[
        "GET /api/v1/campaigns",
        "POST /api/v1/campaigns",
        "GET /api/v1/campaigns/mine",
      ]}
    />
  );
}

export function MerchantViewStatisticsPage() {
  return (
    <MerchantFeatureUnavailablePage
      title="Thống kê lượt xem"
      description="Trong backend hiện tại chưa có API ghi nhận hoặc đọc lượt xem nhà hàng. Khi BE bổ sung contract, FE sẽ nối biểu đồ và số liệu tại trang này."
      missingApis={[
        "GET /api/v1/merchants/me/views",
        "GET /api/v1/merchants/me/statistics",
        "POST /api/v1/merchants/{id}/views",
      ]}
    />
  );
}
