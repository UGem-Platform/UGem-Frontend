import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { OnboardingSchema } from "../schema";

type Props = {
  register: UseFormRegister<OnboardingSchema>;
  errors: FieldErrors<OnboardingSchema>;
};

export function UnderratedReasonStep({ register, errors }: Props) {
  return (
    <section className="onboarding-card">
      <h2>Lý do quán underrated</h2>

      <label>
        <span>Điều gì khiến quán của bạn xứng đáng được biết đến? *</span>
        <textarea
          placeholder="Ví dụ: Quán nhỏ trong hẻm, món ăn gia truyền, chưa được nhiều người biết nhưng khách quen đánh giá cao..."
          {...register("underratedReason")}
        />
        {errors.underratedReason && (
          <small>{errors.underratedReason.message}</small>
        )}
      </label>

      <div className="onboarding-tip">
        <strong>UI trước</strong>
        <p>
          Backend chưa có field riêng cho lý do underrated, nên nội dung này sẽ
          được gộp vào description khi gửi hồ sơ.
        </p>
      </div>
    </section>
  );
}
