import {
  CheckCircle2,
  Circle,
  Clock3,
  HelpCircle,
  Home,
  Mail,
  MapPin,
  SearchCheck,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/features/auth";
import { useMyApplications } from "../hooks/useMyApplications";
import type { MerchantApplication } from "../types";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";
import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";

function getLatestApplication(applications: MerchantApplication[]) {
  return [...applications].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    return dateB - dateA;
  })[0];
}

function getStatusBadge(status?: string) {
  if (status === "Approved") return "Đã được duyệt";
  if (status === "Rejected") return "Bị từ chối";
  if (status === "Pending") return "Đang thẩm định";
  return "Chưa gửi hồ sơ";
}

function formatDate(value?: string) {
  if (!value) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function StepItem({
  active,
  done,
  title,
  description,
  icon,
}: {
  active?: boolean;
  done?: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`status-step ${active ? "active" : ""} ${done ? "done" : ""}`}
    >
      <div className="status-step-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function MerchantApplicationStatusPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useMyApplications();

  const application = getLatestApplication(applications);
  const status = application?.status;

  const isPending = status === "Pending";
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";

  return (
    <main className="merchant-portal-layout">
      <MerchantSidebar />

      <section className="merchant-main">
        <MerchantHeader />

        <div className="merchant-content">
          <section className="merchant-status-content">
            <div className="status-heading">
              <h1>Trạng thái hồ sơ</h1>
              <p>Theo dõi quá trình thẩm định quán của bạn.</p>
            </div>

            {isLoading && (
              <section className="status-empty-card">
                <Clock3 size={28} />
                <h2>Đang tải hồ sơ...</h2>
                <p>Vui lòng chờ trong giây lát.</p>
              </section>
            )}

            {isError && (
              <section className="status-empty-card">
                <HelpCircle size={28} />
                <h2>Không tải được trạng thái</h2>
                <p>
                  {error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi lấy hồ sơ."}
                </p>
              </section>
            )}

            {!isLoading && !application && (
              <section className="status-empty-card">
                <Store size={28} />
                <h2>Chưa gửi hồ sơ</h2>
                <p>
                  Bạn chưa có hồ sơ quán nào. Hãy gửi hồ sơ để bắt đầu thẩm
                  định.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/merchant/application/create")}
                >
                  Gửi hồ sơ quán
                </button>
              </section>
            )}

            {application && (
              <>
                <section className="application-summary-card">
                  <div className="application-cover">
                    <img
                      src={
                        application.logoUrl ||
                        "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80"
                      }
                      alt=""
                    />

                    <span>{getStatusBadge(status)}</span>
                  </div>

                  <div className="application-info">
                    <h2>{application.name}</h2>

                    <p>
                      <MapPin size={15} />
                      {extractDescriptionLine(
                        application.description,
                        "Địa chỉ",
                      ) || "Địa chỉ đang chờ cập nhật"}
                    </p>

                    <p>
                      <Mail size={15} />
                      {application.email || user?.Email || "merchant@gmail.com"}
                    </p>

                    <p>
                      <Clock3 size={15} />
                      Ngày gửi: {formatDate(application.createdAt)}
                    </p>
                  </div>
                </section>

                <section className="review-timeline-card">
                  <h2>Tiến trình xét duyệt</h2>

                  <div className="status-steps">
                    <StepItem
                      done
                      title="Đã gửi hồ sơ"
                      description="Hồ sơ quán đã được gửi lên hệ thống."
                      icon={<CheckCircle2 size={18} />}
                    />

                    <StepItem
                      active={isPending}
                      done={isApproved || isRejected}
                      title="Censor đang thẩm định"
                      description="Censor kiểm tra xem quán có thật sự underrated hay không."
                      icon={<SearchCheck size={18} />}
                    />

                    <div className="status-note-box">
                      ƯỚC TÍNH: 1–2 NGÀY LÀM VIỆC
                    </div>

                    <StepItem
                      active={isApproved || isRejected}
                      done={isApproved}
                      title="Chờ Staff phê duyệt"
                      description="Staff xem xét kết quả thẩm định."
                      icon={
                        isApproved ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <ShieldCheck size={18} />
                        )
                      }
                    />

                    <StepItem
                      active={isApproved || isRejected}
                      done={isApproved}
                      title="Kết quả xét duyệt"
                      description={
                        isApproved
                          ? "Hồ sơ đã được duyệt."
                          : isRejected
                            ? "Hồ sơ bị từ chối. Bạn có thể gửi lại."
                            : "Thông báo chính thức về hồ sơ."
                      }
                      icon={
                        isApproved ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Circle size={18} />
                        )
                      }
                    />

                    <StepItem
                      active={isApproved}
                      done={isApproved}
                      title="Active trên UGem"
                      description={
                        isApproved
                          ? "Quán đã sẵn sàng hiển thị cho Customer."
                          : "Quán đã được hiển thị cho Customer."
                      }
                      icon={<Home size={18} />}
                    />
                  </div>

                  {isRejected && (
                    <button
                      className="resubmit-button"
                      type="button"
                      onClick={() => navigate("/merchant/application/create")}
                    >
                      Chỉnh sửa và gửi lại hồ sơ
                    </button>
                  )}

                  {isApproved && (
                    <button
                      className="resubmit-button"
                      type="button"
                      onClick={() => navigate("/merchant")}
                    >
                      Về Merchant Portal
                    </button>
                  )}
                </section>

                <section className="support-card">
                  <div>
                    <User size={20} />
                  </div>

                  <div>
                    <h3>Cần hỗ trợ?</h3>
                    <p>
                      Nếu bạn có thắc mắc về quá trình thẩm định, hãy nhắn cho
                      chúng tôi.
                    </p>
                  </div>

                  <button type="button">Nhắn tin với Support</button>
                </section>
              </>
            )}
          </section>
        </div>
      </section>

      <nav className="mobile-status-nav">
        <button type="button" onClick={() => navigate("/merchant")}>
          <Home size={18} />
          Dashboard
        </button>

        <button
          className="active"
          type="button"
          onClick={() => navigate("/merchant/application/create")}
        >
          <Store size={18} />
          Application
        </button>

        <button type="button">
          <User size={18} />
          Profile
        </button>
      </nav>
    </main>
  );
}

function extractDescriptionLine(description: string, label: string) {
  const line = description
    .split("\n")
    .find((item) => item.trim().startsWith(`${label}:`));

  return line?.replace(`${label}:`, "").trim();
}
