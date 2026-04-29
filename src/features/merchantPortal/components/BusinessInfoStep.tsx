import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { OnboardingSchema } from "../schema";

type Props = {
  register: UseFormRegister<OnboardingSchema>;
  errors: FieldErrors<OnboardingSchema>;
  setValue: UseFormSetValue<OnboardingSchema>;
  watch: UseFormWatch<OnboardingSchema>;
};

const priceRanges = ["Tiết kiệm", "Bình dân", "Tầm trung"];

export function BusinessInfoStep({ register, errors, setValue, watch }: Props) {
  const priceRange = watch("priceRange");

  return (
    <section className="onboarding-card">
      <h2>Thông tin cơ bản</h2>

      <label>
        <span>Tên quán của bạn *</span>
        <input
          placeholder="Ví dụ: Bún Chả Bà Hải - Hẻm 12"
          {...register("restaurantName")}
        />
        {errors.restaurantName && (
          <small>{errors.restaurantName.message}</small>
        )}
      </label>

      <label>
        <span>Email liên hệ *</span>
        <input placeholder="merchant@gmail.com" {...register("email")} />
        {errors.email && <small>{errors.email.message}</small>}
      </label>

      <div className="two-cols">
        <label>
          <span>Loại hình quán *</span>
          <select {...register("restaurantType")}>
            <option value="">Chọn loại hình</option>
            <option value="Quán ăn gia đình">Quán ăn gia đình</option>
            <option value="Quán vỉa hè">Quán vỉa hè</option>
            <option value="Nhà hàng nhỏ">Nhà hàng nhỏ</option>
            <option value="Xe đẩy / gánh hàng">Xe đẩy / gánh hàng</option>
          </select>
          {errors.restaurantType && (
            <small>{errors.restaurantType.message}</small>
          )}
        </label>

        <label>
          <span>Loại món chính *</span>
          <select {...register("mainDishType")}>
            <option value="">Chọn món chính</option>
            <option value="Phở / Bún / Mì">Phở / Bún / Mì</option>
            <option value="Cơm">Cơm</option>
            <option value="Bánh mì">Bánh mì</option>
            <option value="Ăn vặt">Ăn vặt</option>
            <option value="Đặc sản vùng miền">Đặc sản vùng miền</option>
          </select>
          {errors.mainDishType && <small>{errors.mainDishType.message}</small>}
        </label>
      </div>

      <div>
        <span className="field-title">Khoảng giá trung bình *</span>

        <div className="price-options">
          {priceRanges.map((item) => (
            <button
              key={item}
              type="button"
              className={priceRange === item ? "selected" : ""}
              onClick={() =>
                setValue("priceRange", item, { shouldValidate: true })
              }
            >
              {item}
            </button>
          ))}
        </div>

        {errors.priceRange && <small>{errors.priceRange.message}</small>}
      </div>

      <label>
        <span>Mô tả ngắn về quán *</span>
        <textarea
          placeholder="Chia sẻ một chút về câu chuyện hoặc điểm đặc biệt của quán..."
          {...register("description")}
        />
        {errors.description && <small>{errors.description.message}</small>}
      </label>

      <div className="onboarding-tip">
        <strong>Mẹo cho chủ quán</strong>
        <p>
          Hãy mô tả quán thật chân thực. UGem yêu thích những câu chuyện đằng
          sau các món ăn “underrated”.
        </p>
      </div>
    </section>
  );
}
