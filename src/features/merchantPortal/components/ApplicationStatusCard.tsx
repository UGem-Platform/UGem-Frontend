import type { MerchantApplication } from "../types";

function getStatusText(application?: MerchantApplication) {
  if (!application) {
    return {
      label: "Chưa gửi hồ sơ",
      description:
        "Hãy bắt đầu gửi thông tin để quán của bạn được xuất hiện trên UGem.",
    };
  }

  if (application.status === "Pending") {
    return {
      label: "Đang xét duyệt",
      description: "Hồ sơ của bạn đang được staff kiểm tra và thẩm định.",
    };
  }

  if (application.status === "Approved") {
    return {
      label: "Đã được duyệt",
      description: "Quán của bạn đã được duyệt và có thể hiển thị trên UGem.",
    };
  }

  if (application.status === "Rejected") {
    return {
      label: "Bị từ chối",
      description: "Hồ sơ chưa đạt yêu cầu. Bạn có thể chỉnh sửa và gửi lại.",
    };
  }

  return {
    label: application.status,
    description: "Trạng thái hồ sơ hiện tại của bạn.",
  };
}

export function ApplicationStatusCard({
  application,
}: {
  application?: MerchantApplication;
}) {
  const status = getStatusText(application);

  return (
    <section className="merchant-status-card">
      <div className="status-icon">🏪</div>

      <p>TRẠNG THÁI HIỆN TẠI</p>

      <h2>{status.label}</h2>

      <span>{status.description}</span>
    </section>
  );
}
