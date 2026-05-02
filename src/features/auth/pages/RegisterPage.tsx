import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
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

const CAPTIONS = [
  {
    title: "Hidden Gem miền Bắc",
    subtitle: "Phở Gánh Hàng Chiếu • Hà Nội",
  },
  {
    title: "Hương vị miền Trung",
    subtitle: "Bún Bò Huế O Xuân • TP.HCM",
  },
  {
    title: "Quán ngon miền Nam",
    subtitle: "Cơm Tấm Ba Ghiền • TP.HCM",
  },
  {
    title: "Đặc sản miền Trung",
    subtitle: "Mì Quảng Bà Mua • Đà Nẵng",
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [slide, setSlide] = useState(0);

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
    <main className="grid min-h-screen grid-cols-1 bg-gradient-to-br from-cyan-50 via-sky-50 to-amber-50 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="relative min-h-[48vh] lg:min-h-screen">
        <HeroCarousel images={HERO_IMAGES} onChange={setSlide} />

        <div className="absolute bottom-6 left-6 z-30 max-w-sm rounded-2xl border border-white/30 bg-white/88 p-4 shadow-xl backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-100 text-lg">
              🥗
            </span>
            <div>
              <strong className="block text-sm text-slate-900">
                {CAPTIONS[slide]?.title}
              </strong>
              <small className="text-xs text-slate-600">
                {CAPTIONS[slide]?.subtitle}
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white/85 p-8 shadow-2xl backdrop-blur-xl border border-white/60">
            <Logo />

            <div className="mt-6 space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Tạo tài khoản
              </h1>
              <p className="text-sm text-slate-600">
                Chọn vai trò Customer hoặc Merchant để bắt đầu.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Họ và tên"
                            autoComplete="name"
                            className="h-12 rounded-2xl pl-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            className="h-12 rounded-2xl pl-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Số điện thoại"
                            autoComplete="tel"
                            className="h-12 rounded-2xl pl-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Mật khẩu"
                            autoComplete="new-password"
                            className="h-12 rounded-2xl pl-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm font-medium text-red-600" />
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
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                            field.value === "Customer"
                              ? "border-cyan-600 bg-cyan-50"
                              : "border-slate-200 hover:border-cyan-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="Customer"
                            className="hidden"
                            checked={field.value === "Customer"}
                            onChange={() => field.onChange("Customer")}
                          />
                          <div className="text-center">
                            <div className="text-2xl">🛒</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              Khách hàng
                            </div>
                            <div className="text-xs text-slate-500">
                              Tìm và đặt món
                            </div>
                          </div>
                        </label>
                        <label
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                            field.value === "Merchant"
                              ? "border-cyan-600 bg-cyan-50"
                              : "border-slate-200 hover:border-cyan-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="Merchant"
                            className="hidden"
                            checked={field.value === "Merchant"}
                            onChange={() => field.onChange("Merchant")}
                          />
                          <div className="text-center">
                            <div className="text-2xl">🏪</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              Shop/Chủ quán
                            </div>
                            <div className="text-xs text-slate-500">
                              Đăng ký bán hàng
                            </div>
                          </div>
                        </label>
                      </div>
                      <FormMessage className="text-sm font-medium text-red-600" />
                    </FormItem>
                  )}
                />

                {apiError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {apiError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-2xl bg-cyan-700 text-base font-semibold text-white hover:bg-cyan-800 disabled:opacity-70"
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {submitting ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
              </form>
            </Form>

            <p className="mt-4 text-center text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-cyan-700 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Bằng cách tiếp tục, bạn đồng ý điều khoản & chính sách
          </p>
        </div>
      </section>
    </main>
  );
}
