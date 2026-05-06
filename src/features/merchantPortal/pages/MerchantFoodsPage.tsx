import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createFood, deleteFood, getFoods } from "../services/foodService";
import type { Food } from "../types";
import { getCategories } from "@/shared/services/categoryService";
import type { Category } from "@/shared/types";
import { notify } from "@/shared/lib/notify";

export function MerchantFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryIds: [] as string[],
  });

  async function loadData() {
    setLoading(true);

    try {
      const [foodData, categoryData] = await Promise.all([
        getFoods(),
        getCategories(),
      ]);

      setFoods(foodData);
      setCategories(categoryData);
    } catch (error) {
      console.error(error);
      notify.error("Không tải được dữ liệu món ăn.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, []);

  async function handleCreateFood(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      notify.error("Vui lòng nhập tên món.");
      return;
    }

    setCreating(true);

    try {
      await createFood({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        imageUrl: form.imageUrl.trim(),
        isAvailable: true,
        categoryIds: form.categoryIds,
      });

      notify.success("Tạo món thành công.");

      setForm({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryIds: [],
      });

      await loadData();
    } catch (error) {
      console.error(error);
      notify.error("Tạo món thất bại.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteFood(foodId: string) {
    setDeletingFoodId(foodId);

    try {
      await deleteFood(foodId);
      notify.success("Đã xóa món.");
      await loadData();
    } catch (error) {
      console.error(error);
      notify.error("Xóa món thất bại.");
    } finally {
      setDeletingFoodId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-amber-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Quản lý món ăn</h1>
          <p className="text-sm text-slate-500">
            Tạo, xem và xóa món ăn của merchant hiện tại.
          </p>
        </div>

        <form
          onSubmit={handleCreateFood}
          className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur"
        >
          <h2 className="mb-4 text-lg font-semibold">Thêm món mới</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Tên món *</span>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Bún bò Huế"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Giá *</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                placeholder="45000"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Mô tả</span>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Đậm vị Huế"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Ảnh URL</span>
              <input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Danh mục</span>
              <select
                multiple
                value={form.categoryIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(
                    (option) => option.value,
                  );

                  setForm((prev) => ({ ...prev, categoryIds: selected }));
                }}
                className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            <Plus size={18} />
            {creating ? "Đang tạo..." : "Thêm món"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold">Danh sách món</h2>

          {loading && <p className="text-slate-500">Đang tải...</p>}

          {!loading && foods.length === 0 && (
            <p className="text-slate-500">Chưa có món nào.</p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {foods.map((food) => (
              <div
                key={food.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  {food.imageUrl && (
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{food.name}</h3>
                      <button
                        type="button"
                        onClick={() => void handleDeleteFood(food.id)}
                        disabled={deletingFoodId === food.id}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        aria-label="Xóa món"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {food.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {food.description}
                      </p>
                    )}

                    <p className="mt-2 font-medium text-cyan-700">
                      {food.price.toLocaleString("vi-VN")}đ
                    </p>

                    {typeof food.isAvailable === "boolean" && (
                      <p className="mt-1 text-xs text-slate-500">
                        {food.isAvailable ? "Đang bán" : "Tạm ẩn"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
