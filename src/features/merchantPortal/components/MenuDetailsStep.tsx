import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { OnboardingSchema } from "../schema";

type Props = {
  control: Control<OnboardingSchema>;
  register: UseFormRegister<OnboardingSchema>;
  errors: FieldErrors<OnboardingSchema>;
};

export function MenuDetailsStep({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "menu",
  });

  return (
    <section className="onboarding-card">
      <h2>Thực đơn & hình ảnh</h2>

      <div className="menu-list">
        {fields.map((field, index) => (
          <article className="menu-item-card" key={field.id}>
            <div className="menu-item-title">
              <strong>Món #{index + 1}</strong>

              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <label>
              <span>Tên món *</span>
              <input
                placeholder="Ví dụ: Bún bò Huế"
                {...register(`menu.${index}.name`)}
              />
              {errors.menu?.[index]?.name && (
                <small>{errors.menu[index]?.name?.message}</small>
              )}
            </label>

            <label>
              <span>Mô tả món *</span>
              <input
                placeholder="Mô tả ngắn về món"
                {...register(`menu.${index}.description`)}
              />
            </label>

            <div className="two-cols">
              <label>
                <span>Giá *</span>
                <input
                  type="number"
                  placeholder="45000"
                  {...register(`menu.${index}.price`)}
                />
              </label>

              <label>
                <span>Danh mục</span>
                <input
                  placeholder="Bún / Mì"
                  {...register(`menu.${index}.category`)}
                />
              </label>
            </div>

            <label>
              <span>Ảnh món ăn URL</span>
              <input
                placeholder="https://..."
                {...register(`menu.${index}.imageUrl`)}
              />
            </label>
          </article>
        ))}
      </div>

      {typeof errors.menu?.message === "string" && (
        <small>{errors.menu.message}</small>
      )}

      <button
        className="add-menu-button"
        type="button"
        onClick={() =>
          append({
            name: "",
            description: "",
            price: 0,
            imageUrl: "",
            category: "",
          })
        }
      >
        <Plus size={18} />
        Thêm món
      </button>
    </section>
  );
}
