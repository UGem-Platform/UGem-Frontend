import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { OnboardingFormValues } from "../schema";

type Props = {
  control: Control<OnboardingFormValues>;
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  setValue: UseFormSetValue<OnboardingFormValues>;
};

function isProbablyImageUrl(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return false;

  return (
    trimmed.startsWith("data:image/") ||
    /^https?:\/\//i.test(trimmed) ||
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(trimmed)
  );
}

export function MenuDetailsStep({
  control,
  register,
  errors,
  setValue,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "menu",
  });

  const [uploadedFileNamesById, setUploadedFileNamesById] = useState<
    Record<string, string>
  >({});

  const menuValues = useWatch({
    control,
    name: "menu",
  });

  async function handleUpload(index: number, file?: File) {
    if (!file) return;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Không thể đọc file"));
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : "");
      reader.readAsDataURL(file);
    });

    setUploadedFileNamesById((previous) => ({
      ...previous,
      [fields[index]?.id ?? String(index)]: file.name,
    }));

    setValue(`menu.${index}.imageUploadDataUrl`, dataUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

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
              {errors.menu?.[index]?.description && (
                <small>{errors.menu[index]?.description?.message}</small>
              )}
            </label>

            <div className="two-cols">
              <label>
                <span>Giá *</span>
                <input
                  type="number"
                  placeholder="45000"
                  {...register(`menu.${index}.price`, {
                    valueAsNumber: true,
                  })}
                />
                {errors.menu?.[index]?.price && (
                  <small>{errors.menu[index]?.price?.message}</small>
                )}
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

              {(() => {
                const imageUrl = menuValues?.[index]?.imageUrl;
                if (!imageUrl || !isProbablyImageUrl(imageUrl)) return null;

                return (
                  <div className="menu-image-preview">
                    <img
                      src={imageUrl}
                      alt={`Ảnh món #${index + 1} (URL)`}
                      loading="lazy"
                    />
                  </div>
                );
              })()}
            </label>

            <label>
              <span>Tải ảnh từ máy</span>
              <div className="file-upload-row">
                <input
                  id={`menu-image-upload-${field.id}`}
                  className="file-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleUpload(index, event.target.files?.[0])
                  }
                />
                <label
                  className="file-upload-button"
                  htmlFor={`menu-image-upload-${field.id}`}
                >
                  Chọn ảnh
                </label>
                <span className="file-upload-name">
                  {uploadedFileNamesById[field.id] || "Chưa chọn ảnh"}
                </span>
              </div>

              {(() => {
                const uploadSrc = menuValues?.[index]?.imageUploadDataUrl;
                if (!uploadSrc || !uploadSrc.trim().startsWith("data:image/")) {
                  return null;
                }

                return (
                  <div className="menu-image-preview">
                    <img
                      src={uploadSrc}
                      alt={`Ảnh món #${index + 1} (Upload)`}
                      loading="lazy"
                    />
                  </div>
                );
              })()}
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
            imageUploadDataUrl: "",
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
