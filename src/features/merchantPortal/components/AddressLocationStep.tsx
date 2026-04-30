import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { OnboardingFormValues } from "../schema";

type Props = {
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
};

export function AddressLocationStep({ register, errors }: Props) {
  return (
    <section className="onboarding-card">
      <h2>Địa chỉ & vị trí</h2>

      <label>
        <span>Địa chỉ quán *</span>
        <input
          placeholder="Ví dụ: 12 Nguyễn Trãi, Quận 1, TP.HCM"
          {...register("address")}
        />
        {errors.address && <small>{errors.address.message}</small>}
      </label>

      <div className="two-cols">
        <label>
          <span>Latitude *</span>
          <input
            type="number"
            step="any"
            placeholder="10.7769"
            {...register("latitude", { valueAsNumber: true })}
          />
          {errors.latitude && <small>{errors.latitude.message}</small>}
        </label>

        <label>
          <span>Longitude *</span>
          <input
            type="number"
            step="any"
            placeholder="106.7009"
            {...register("longitude", { valueAsNumber: true })}
          />
          {errors.longitude && <small>{errors.longitude.message}</small>}
        </label>
      </div>

      <div className="mock-map">
        UI bản đồ trước — backend chưa có API geocoding / chọn map.
      </div>
    </section>
  );
}
