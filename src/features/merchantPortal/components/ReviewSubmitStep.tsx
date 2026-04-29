import type { UseFormWatch } from "react-hook-form";
import type { OnboardingSchema } from "../schema";

export function ReviewSubmitStep({
  watch,
}: {
  watch: UseFormWatch<OnboardingSchema>;
}) {
  const values = watch();

  return (
    <section className="onboarding-card">
      <h2>Kiểm tra & gửi</h2>

      <div className="review-grid">
        <article>
          <span>Tên quán</span>
          <strong>{values.restaurantName || "Chưa nhập"}</strong>
        </article>

        <article>
          <span>Email</span>
          <strong>{values.email || "Chưa nhập"}</strong>
        </article>

        <article>
          <span>Loại hình</span>
          <strong>{values.restaurantType || "Chưa chọn"}</strong>
        </article>

        <article>
          <span>Món chính</span>
          <strong>{values.mainDishType || "Chưa chọn"}</strong>
        </article>

        <article>
          <span>Khoảng giá</span>
          <strong>{values.priceRange || "Chưa chọn"}</strong>
        </article>

        <article>
          <span>Địa chỉ</span>
          <strong>{values.address || "Chưa nhập"}</strong>
        </article>
      </div>

      <div className="onboarding-tip">
        <strong>Sau khi gửi</strong>
        <p>
          Hồ sơ sẽ được gửi đến staff để xét duyệt. Các phần chưa có API riêng
          sẽ được lưu tạm trong phần mô tả.
        </p>
      </div>
    </section>
  );
}
