import type { UseFormWatch } from "react-hook-form";
import type { OnboardingFormValues } from "../schema";

function formatMoney(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Chưa nhập";
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function getMenuImageSrc(item?: OnboardingFormValues["menu"][number]) {
  if (!item) return "";
  return (item.imageUploadDataUrl || item.imageUrl || "").trim();
}

function shouldShowImage(src?: string) {
  if (!src) return false;
  return src.startsWith("data:image/") || /^https?:\/\//i.test(src);
}

export function ReviewSubmitStep({
  watch,
}: {
  watch: UseFormWatch<OnboardingFormValues>;
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

        <article>
          <span>Latitude</span>
          <strong>{String(values.latitude ?? "Chưa nhập")}</strong>
        </article>

        <article>
          <span>Longitude</span>
          <strong>{String(values.longitude ?? "Chưa nhập")}</strong>
        </article>

        <article className="review-grid-wide">
          <span>Mô tả quán</span>
          <strong>{values.description || "Chưa nhập"}</strong>
        </article>
      </div>

      <section className="review-block">
        <h3>Thực đơn</h3>

        {values.menu?.length ? (
          <div className="review-menu-list">
            {values.menu.map((menuItem, index) => {
              const imageSrc = getMenuImageSrc(menuItem);
              return (
                <article key={index} className="review-menu-card">
                  <div className="review-menu-header">
                    <strong>
                      Món #{index + 1}: {menuItem.name || "Chưa nhập"}
                    </strong>
                    <span>{formatMoney(menuItem.price)}</span>
                  </div>

                  <p className="review-menu-desc">
                    {menuItem.description || "Chưa nhập mô tả"}
                  </p>

                  {menuItem.category && (
                    <p className="review-menu-meta">
                      Danh mục: <strong>{menuItem.category}</strong>
                    </p>
                  )}

                  {shouldShowImage(imageSrc) && (
                    <div className="menu-image-preview">
                      <img
                        src={imageSrc}
                        alt={`Ảnh món #${index + 1}`}
                        loading="lazy"
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="review-empty">Chưa có món nào.</p>
        )}
      </section>

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
