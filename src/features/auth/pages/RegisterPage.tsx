import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import HeroCarousel from "../components/HeroCarousel";
import { Logo } from "./Logo";
import { Button } from "@/shared/components/ui/button";
import { notify } from "@/shared/lib/notify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { registerSchema, type RegisterSchema } from "../schema";
import { registerApi } from "../services";

const HERO_IMAGES = [
  "https://mia.vn/media/uploads/blog-du-lich/pho-ganh-ha-noi-01-1702697225.jpg",
  "https://static.vinwonders.com/production/bun-bo-hue-1.jpg",
  "https://bandembanhom.com/wp-content/uploads/2025/01/Com-Tam-3-Ghien-1.webp",
  "https://adormusic.s3.us-east-2.amazonaws.com/wp-content/uploads/2023/07/22045644/mi-quang-ba-mua-5-1024x1024.jpeg",
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [, setSlide] = useState(0);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "Customer",
    },
  });

  async function onSubmit(values: RegisterSchema) {
    setApiError("");
    setSubmitting(true);

    try {
      const res = await registerApi({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
        role: values.role,
      });

      if (!res.success) {
        throw new Error(res.message || "Đăng ký thất bại");
      }

      notify.success("Đăng ký thành công. Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_32%),linear-gradient(135deg,#ecfeff_0%,#f8fafc_46%,#fff7ed_100%)] lg:grid-cols-[1.18fr_0.82fr]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none fixed left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

      <section className="relative min-h-[52vh] p-3 lg:min-h-screen lg:p-4">
        <HeroCarousel images={HERO_IMAGES} onChange={setSlide} />
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-2xl shadow-cyan-950/10 ring-1 ring-slate-950/5 backdrop-blur-2xl">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />

            <div className="relative">
              <Logo />

              <div className="mt-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 shadow-sm shadow-cyan-950/5">
                  Create UGem Account
                </div>

                <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                  Tạo tài khoản
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Chọn vai trò Customer hoặc Merchant để bắt đầu khám phá quán
                  ngon địa phương và mở rộng kinh doanh trên UGem.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-7 space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="group relative">
                            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cyan-700" />
                            <Input
                              placeholder="Họ và tên"
                              autoComplete="name"
                              className="h-12 rounded-2xl border-white/70 bg-white/85 pl-12 text-base font-semibold text-slate-950 shadow-sm ring-1 ring-slate-950/5 transition-all placeholder:text-slate-400 focus-visible:border-cyan-500 focus-visible:ring-4 focus-visible:ring-cyan-500/15"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm font-semibold text-rose-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="group relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cyan-700" />
                            <Input
                              type="email"
                              placeholder="Email"
                              autoComplete="email"
                              className="h-12 rounded-2xl border-white/70 bg-white/85 pl-12 text-base font-semibold text-slate-950 shadow-sm ring-1 ring-slate-950/5 transition-all placeholder:text-slate-400 focus-visible:border-cyan-500 focus-visible:ring-4 focus-visible:ring-cyan-500/15"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm font-semibold text-rose-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="group relative">
                            <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cyan-700" />
                            <Input
                              placeholder="Số điện thoại"
                              autoComplete="tel"
                              className="h-12 rounded-2xl border-white/70 bg-white/85 pl-12 text-base font-semibold text-slate-950 shadow-sm ring-1 ring-slate-950/5 transition-all placeholder:text-slate-400 focus-visible:border-cyan-500 focus-visible:ring-4 focus-visible:ring-cyan-500/15"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm font-semibold text-rose-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="group relative">
                            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cyan-700" />
                            <Input
                              type="password"
                              placeholder="Mật khẩu"
                              autoComplete="new-password"
                              className="h-12 rounded-2xl border-white/70 bg-white/85 pl-12 text-base font-semibold text-slate-950 shadow-sm ring-1 ring-slate-950/5 transition-all placeholder:text-slate-400 focus-visible:border-cyan-500 focus-visible:ring-4 focus-visible:ring-cyan-500/15"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm font-semibold text-rose-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-3">
                          <label
                            className={`group cursor-pointer rounded-2xl border p-4 shadow-sm ring-1 transition-all ${
                              field.value === "Customer"
                                ? "border-cyan-200 bg-cyan-50 text-cyan-900 ring-cyan-100"
                                : "border-white/70 bg-white/80 text-slate-700 ring-slate-950/5 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/60"
                            }`}
                            aria-label="Khách hàng"
                          >
                            <input
                              type="radio"
                              value="Customer"
                              className="hidden"
                              checked={field.value === "Customer"}
                              onChange={() => field.onChange("Customer")}
                            />

                            <div className="text-center">
                              <div
                                className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl ${
                                  field.value === "Customer"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"
                                }`}
                              >
                                <ShoppingBag className="h-5 w-5" />
                              </div>

                              <div className="mt-3 text-sm font-black">
                                Khách hàng
                              </div>

                              <div className="mt-0.5 text-xs font-semibold text-slate-500">
                                Tìm và đặt món
                              </div>
                            </div>
                          </label>

                          <label
                            className={`group cursor-pointer rounded-2xl border p-4 shadow-sm ring-1 transition-all ${
                              field.value === "Merchant"
                                ? "border-cyan-200 bg-cyan-50 text-cyan-900 ring-cyan-100"
                                : "border-white/70 bg-white/80 text-slate-700 ring-slate-950/5 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/60"
                            }`}
                            aria-label="Shop/Chủ quán"
                          >
                            <input
                              type="radio"
                              value="Merchant"
                              className="hidden"
                              checked={field.value === "Merchant"}
                              onChange={() => field.onChange("Merchant")}
                            />

                            <div className="text-center">
                              <div
                                className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl ${
                                  field.value === "Merchant"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"
                                }`}
                              >
                                <Store className="h-5 w-5" />
                              </div>

                              <div className="mt-3 text-sm font-black">
                                Shop/Chủ quán
                              </div>

                              <div className="mt-0.5 text-xs font-semibold text-slate-500">
                                Đăng ký bán hàng
                              </div>
                            </div>
                          </label>
                        </div>

                        <FormMessage className="text-sm font-semibold text-rose-600" />
                      </FormItem>
                    )}
                  />

                  {apiError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/85 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm ring-1 ring-rose-100">
                      {apiError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-2xl bg-cyan-700 text-base font-black text-white shadow-lg shadow-cyan-900/20 transition-all hover:-translate-y-0.5 hover:bg-cyan-800 hover:shadow-xl hover:shadow-cyan-900/25 disabled:translate-y-0 disabled:opacity-70"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    {submitting ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>
                </form>
              </Form>

              <p className="mt-5 text-center text-sm text-slate-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-black text-cyan-700 transition hover:text-cyan-800"
                >
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs font-medium leading-6 text-slate-500">
            Bằng cách tiếp tục, bạn đồng ý điều khoản & chính sách của UGem.
          </p>
        </div>
      </section>
    </main>
  );
}
