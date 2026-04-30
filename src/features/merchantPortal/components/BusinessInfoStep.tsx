import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Info, Mail, Store, Tags, Utensils, WalletCards } from "lucide-react";
import type { OnboardingFormValues } from "../schema";

type Props = {
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  setValue: UseFormSetValue<OnboardingFormValues>;
  watch: UseFormWatch<OnboardingFormValues>;
};

const priceRanges = ["Tiết kiệm", "Bình dân", "Tầm trung"];

export function BusinessInfoStep({ register, errors, setValue, watch }: Props) {
  const priceRange = watch("priceRange");

  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 h-44 w-44 rounded-full bg-amber-200/20 blur-3xl" />

      <div className="relative">
        <div className="mb-8 flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-cyan-800 shadow-sm">
            <Store className="h-7 w-7" />
          </div>

          <div>
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">
              Merchant onboarding
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              Thông tin cơ bản
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Giúp UGem hiểu rõ hơn về quán của bạn để xét duyệt và hiển thị
              chính xác.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-800">
              Tên quán của bạn *
            </span>
            <div className="relative">
              <Store className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                placeholder="Ví dụ: Bún Chả Bà Hải - Hẻm 12"
                {...register("restaurantName")}
              />
            </div>
            {errors.restaurantName && (
              <small className="block text-sm font-medium text-rose-600">
                {errors.restaurantName.message}
              </small>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-800">
              Email liên hệ *
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                placeholder="merchant@gmail.com"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <small className="block text-sm font-medium text-rose-600">
                {errors.email.message}
              </small>
            )}
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">
                Loại hình quán *
              </span>
              <div className="relative">
                <Tags className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                  {...register("restaurantType")}
                >
                  <option value="">Chọn loại hình</option>
                  <option value="Quán ăn gia đình">Quán ăn gia đình</option>
                  <option value="Quán vỉa hè">Quán vỉa hè</option>
                  <option value="Nhà hàng nhỏ">Nhà hàng nhỏ</option>
                  <option value="Xe đẩy / gánh hàng">Xe đẩy / gánh hàng</option>
                </select>
              </div>
              {errors.restaurantType && (
                <small className="block text-sm font-medium text-rose-600">
                  {errors.restaurantType.message}
                </small>
              )}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">
                Loại món chính *
              </span>
              <div className="relative">
                <Utensils className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                  {...register("mainDishType")}
                >
                  <option value="">Chọn món chính</option>
                  <option value="Phở / Bún / Mì">Phở / Bún / Mì</option>
                  <option value="Cơm">Cơm</option>
                  <option value="Bánh mì">Bánh mì</option>
                  <option value="Ăn vặt">Ăn vặt</option>
                  <option value="Đặc sản vùng miền">Đặc sản vùng miền</option>
                </select>
              </div>
              {errors.mainDishType && (
                <small className="block text-sm font-medium text-rose-600">
                  {errors.mainDishType.message}
                </small>
              )}
            </label>
          </div>

          <div className="space-y-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <WalletCards className="h-4 w-4 text-cyan-700" />
              Khoảng giá trung bình *
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {priceRanges.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`
                    h-12 rounded-2xl border text-sm font-bold shadow-sm transition
                    focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20
                    ${
                      priceRange === item
                        ? "border-cyan-600 bg-cyan-700 text-white shadow-cyan-900/20"
                        : "border-slate-200 bg-white/90 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                    }
                  `}
                  onClick={() =>
                    setValue("priceRange", item, { shouldValidate: true })
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            {errors.priceRange && (
              <small className="block text-sm font-medium text-rose-600">
                {errors.priceRange.message}
              </small>
            )}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-800">
              Mô tả ngắn về quán *
            </span>
            <textarea
              className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
              placeholder="Chia sẻ một chút về câu chuyện hoặc điểm đặc biệt của quán..."
              {...register("description")}
            />
            {errors.description && (
              <small className="block text-sm font-medium text-rose-600">
                {errors.description.message}
              </small>
            )}
          </label>

          <div className="rounded-3xl border border-cyan-100 bg-cyan-50/80 p-5 text-cyan-950">
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-cyan-800">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-sm font-black">Mẹo cho chủ quán</strong>
                <p className="mt-1 text-sm leading-6 text-cyan-900/80">
                  Hãy mô tả quán thật chân thực. UGem yêu thích những câu chuyện
                  đằng sau các món ăn “underrated”.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
