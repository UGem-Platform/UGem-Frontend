import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createFood, deleteFood, getFoods } from "../services/foodService";
import type { Food } from "../types";
import { getCategories } from "@/shared/services/categoryService";
import type { Category } from "@/shared/types";
import {
  createFoodTopping,
  deleteFoodTopping,
  getFoodToppings,
  type FoodTopping,
} from "@/shared/services/foodToppingService";
import { notify } from "@/shared/lib/notify";
import { MerchantHeader } from "@/shared/layouts/Merchants/MerchantHeader";
import { MerchantSidebar } from "@/shared/layouts/Merchants/MerchantSidebar";

export function MerchantFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);
  const [toppingsByFoodId, setToppingsByFoodId] = useState<
    Record<string, FoodTopping[]>
  >({});
  const [toppingForms, setToppingForms] = useState<
    Record<string, { name: string; price: number }>
  >({});
  const [loadingToppingsByFoodId, setLoadingToppingsByFoodId] = useState<
    Record<string, boolean>
  >({});
  const [savingToppingByFoodId, setSavingToppingByFoodId] = useState<
    Record<string, boolean>
  >({});
  const [deletingToppingId, setDeletingToppingId] = useState<string | null>(
    null,
  );

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

  async function loadToppings(foodId: string) {
    setLoadingToppingsByFoodId((prev) => ({ ...prev, [foodId]: true }));

    try {
      const toppings = await getFoodToppings(foodId);
      setToppingsByFoodId((prev) => ({ ...prev, [foodId]: toppings }));
    } catch (error) {
      console.error(error);
      notify.error("Khong tai duoc danh sach topping.");
    } finally {
      setLoadingToppingsByFoodId((prev) => ({ ...prev, [foodId]: false }));
    }
  }

  function toggleToppings(foodId: string) {
    setExpandedFoodId((prev) => {
      const next = prev === foodId ? null : foodId;
      if (next && !toppingsByFoodId[next]) {
        void loadToppings(next);
      }
      return next;
    });
  }

  async function handleCreateTopping(foodId: string) {
    const currentForm = toppingForms[foodId] ?? { name: "", price: 0 };
    const name = currentForm.name.trim();
    const price = Number(currentForm.price);

    if (!name) {
      notify.error("Vui long nhap ten topping.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      notify.error("Gia topping khong hop le.");
      return;
    }

    setSavingToppingByFoodId((prev) => ({ ...prev, [foodId]: true }));

    try {
      await createFoodTopping({ foodId, name, price });
      notify.success("Da them topping.");
      setToppingForms((prev) => ({
        ...prev,
        [foodId]: { name: "", price: 0 },
      }));
      await loadToppings(foodId);
    } catch (error) {
      console.error(error);
      notify.error("Them topping that bai.");
    } finally {
      setSavingToppingByFoodId((prev) => ({ ...prev, [foodId]: false }));
    }
  }

  async function handleDeleteTopping(foodId: string, toppingId?: string) {
    if (!toppingId) return;

    setDeletingToppingId(toppingId);

    try {
      await deleteFoodTopping(toppingId);
      notify.success("Da xoa topping.");
      await loadToppings(foodId);
    } catch (error) {
      console.error(error);
      notify.error("Xoa topping that bai.");
    } finally {
      setDeletingToppingId(null);
    }
  }

  return (
    <main className="merchant-portal-layout">
      <MerchantSidebar />

      <section className="merchant-main">
        <MerchantHeader />

        <div className="merchant-content">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý món ăn
            </h1>
            <p className="text-sm text-slate-500">
              Tạo, xem và xóa món ăn của merchant hiện tại.
            </p>
          </div>

          <form
            onSubmit={handleCreateFood}
            className="rounded-lg border border-white/70 bg-white/90 p-5 shadow-lg shadow-slate-950/5 backdrop-blur"
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
                  className="w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
                  className="w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
                  className="w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
                  className="w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
                  className="min-h-28 w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-px hover:bg-cyan-700 disabled:translate-y-0 disabled:opacity-50"
            >
              <Plus size={18} />
              {creating ? "Đang tạo..." : "Thêm món"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-white/70 bg-white/90 p-5 shadow-lg shadow-slate-950/5 backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">Danh sách món</h2>

            {loading && <p className="text-slate-500">Đang tải...</p>}

            {!loading && foods.length === 0 && (
              <p className="text-slate-500">Chưa có món nào.</p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md"
                >
                  <div className="flex gap-3">
                    {food.imageUrl && (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{food.name}</h3>
                        <button
                          type="button"
                          onClick={() => void handleDeleteFood(food.id)}
                          disabled={deletingFoodId === food.id}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
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

                  <div className="mt-4 border-t border-dashed border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleToppings(food.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                    >
                      Topping & do them
                      <span className="text-xs text-slate-400">
                        {expandedFoodId === food.id ? "An" : "Mo"}
                      </span>
                    </button>

                    {expandedFoodId === food.id && (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                          <div className="grid gap-3 md:grid-cols-3">
                            <label className="space-y-1">
                              <span className="text-xs font-semibold text-slate-500">
                                Ten topping
                              </span>
                              <input
                                value={toppingForms[food.id]?.name ?? ""}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setToppingForms((prev) => ({
                                    ...prev,
                                    [food.id]: {
                                      name: value,
                                      price: prev[food.id]?.price ?? 0,
                                    },
                                  }));
                                }}
                                placeholder="Them do an kem"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                              />
                            </label>

                            <label className="space-y-1">
                              <span className="text-xs font-semibold text-slate-500">
                                Gia them
                              </span>
                              <input
                                type="number"
                                value={toppingForms[food.id]?.price ?? 0}
                                onChange={(event) => {
                                  const value = Number(event.target.value);
                                  setToppingForms((prev) => ({
                                    ...prev,
                                    [food.id]: {
                                      name: prev[food.id]?.name ?? "",
                                      price: Number.isFinite(value) ? value : 0,
                                    },
                                  }));
                                }}
                                placeholder="5000"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                              />
                            </label>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleCreateTopping(food.id)
                                }
                                disabled={savingToppingByFoodId[food.id]}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-900/10 transition hover:-translate-y-px hover:bg-cyan-700 disabled:translate-y-0 disabled:opacity-60"
                              >
                                <Plus size={16} />
                                {savingToppingByFoodId[food.id]
                                  ? "Dang them..."
                                  : "Them topping"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {loadingToppingsByFoodId[food.id] && (
                          <p className="text-sm text-slate-500">
                            Dang tai topping...
                          </p>
                        )}

                        {!loadingToppingsByFoodId[food.id] &&
                          (toppingsByFoodId[food.id]?.length ?? 0) === 0 && (
                            <p className="text-sm text-slate-500">
                              Chua co topping nao.
                            </p>
                          )}

                        {(toppingsByFoodId[food.id] ?? []).map((topping) => (
                          <div
                            key={topping.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {topping.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {Number(topping.price ?? 0).toLocaleString(
                                  "vi-VN",
                                )}
                                d
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteTopping(food.id, topping.id)
                              }
                              disabled={deletingToppingId === topping.id}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                              aria-label="Xoa topping"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
