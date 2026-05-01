import { ArrowRight } from "lucide-react";
import { ApplicationStatusCard } from "../components/ApplicationStatusCard";
import { TipsSection } from "../components/TipsSection";
import { useMyApplications } from "../hooks/useMyApplications";
import { MerchantSidebar } from "../../../shared/layouts/Merchants/MerchantSidebar";
import { MerchantHeader } from "../../../shared/layouts/Merchants/MerchantHeader";
import { OnboardingSteps } from "../../../shared/layouts/Merchants/OnboardingSteps";

function handleSendApplication() {
  globalThis.location.href = "/merchant/application/create";
}

export function MerchantPortalPage() {
  const { data: applications = [], isLoading } = useMyApplications();

  const latestApplication = applications[0];

  return (
    <main className="merchant-portal-layout">
      <MerchantSidebar />

      <section className="merchant-main">
        <MerchantHeader />

        <div className="merchant-content">
          <section className="merchant-hero-grid">
            <article className="merchant-submit-card">
              <h1>Đăng ký quán ăn của bạn</h1>
              <p>
                UGem chỉ hiển thị những quán ăn thật sự underrated sau khi được
                thẩm định.
              </p>

              <button type="button" onClick={handleSendApplication}>
                Gửi hồ sơ quán
                <ArrowRight size={18} />
              </button>
            </article>

            {isLoading ? (
              <section className="merchant-status-card">
                <p>Đang tải trạng thái...</p>
              </section>
            ) : (
              <ApplicationStatusCard application={latestApplication} />
            )}
          </section>

          <OnboardingSteps />

          <TipsSection />

          <section className="merchant-banner">
            <p>“Nơi những giá trị ẩm thực đích thực được tôn vinh.”</p>
          </section>
        </div>
      </section>
    </main>
  );
}
