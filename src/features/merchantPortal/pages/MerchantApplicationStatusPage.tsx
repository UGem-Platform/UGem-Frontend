import { useEffect, useState } from "react";
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
import type { MerchantDetail } from "@/features/customer/types";
import { getMyMerchantDetail } from "../services";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";
import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";

function getLatestApplication(applications: MerchantApplication[]) {
  return [...applications].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    return dateB - dateA;
  })[0];
}

function getApplicationAddress(
  application: MerchantApplication,
  merchant?: MerchantDetail | null,
) {
  return (
    application.address ||
    merchant?.address ||
    extractDescriptionLine(application.description, "Địa chỉ") ||
    "Địa chỉ đang chờ cập nhật"
  );
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

type StepItemProps = Readonly<{
  active?: boolean;
  done?: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}>;

function getReviewIcon(isApproved: boolean) {
  return isApproved ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />;
}

function getResultIcon(isApproved: boolean) {
  return isApproved ? <CheckCircle2 size={18} /> : <Circle size={18} />;
}

function getResultDescription(isApproved: boolean, isRejected: boolean) {
  if (isApproved) {
    return "Hồ sơ đã được duyệt.";
  }

  if (isRejected) {
    return "Hồ sơ bị từ chối. Bạn có thể gửi lại.";
  }

  return "Thông báo chính thức về hồ sơ.";
}

function getActiveDescription(isApproved: boolean) {
  return isApproved
    ? "Quán đã sẵn sàng hiển thị cho Customer."
    : "Quán đã được hiển thị cho Customer.";
}

function StepItem({ active, done, title, description, icon }: StepItemProps) {
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
  const portalPath = user?.Role === "Customer" ? "/customer" : "/merchant";
  const [merchantDetail, setMerchantDetail] = useState<MerchantDetail | null>(
    null,
  );

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useMyApplications();

  let application = getLatestApplication(applications);
  const status = application?.status;

  const isPending = status === "Pending";
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";
  const applicationAddress = application
    ? getApplicationAddress(application, merchantDetail)
    : "";

  if (
    application &&
    applicationAddress &&
    !extractDescriptionLine(application.description, "Địa chỉ")
  ) {
    application = {
      ...application,
      description: `Địa chỉ: ${applicationAddress}\n${application.description}`,
    };
  }

  useEffect(() => {
    let active = true;

    const loadMerchant = async () => {
      try {
        const data = await getMyMerchantDetail();

        if (active) {
          setMerchantDetail(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (isApproved) {
      queueMicrotask(() => {
        void loadMerchant();
      });
    }

    return () => {
      active = false;
    };
  }, [isApproved]);

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
                        application.applicant?.avatarUrl ||
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
                      {application.applicant?.email ||
                        user?.Email ||
                        "merchant@gmail.com"}
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
                      icon={getReviewIcon(isApproved)}
                    />

                    <StepItem
                      active={isApproved || isRejected}
                      done={isApproved}
                      title="Kết quả xét duyệt"
                      description={getResultDescription(isApproved, isRejected)}
                      icon={getResultIcon(isApproved)}
                    />

                    <StepItem
                      active={isApproved}
                      done={isApproved}
                      title="Active trên UGem"
                      description={getActiveDescription(isApproved)}
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
                    <>
                      <p className="approved-note">
                        Quán của bạn đã được duyệt và hiển thị trên UGem. Nếu
                        cần thay đổi thông tin, vui lòng liên hệ Support.
                      </p>

                      <button
                        className="resubmit-button"
                        type="button"
                        onClick={() => navigate(portalPath)}
                      >
                        Về Merchant Portal
                      </button>
                    </>
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
        <button type="button" onClick={() => navigate(portalPath)}>
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
