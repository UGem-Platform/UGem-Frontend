import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Logo } from "./Logo";
import { registerSchema, type RegisterSchema } from "../schema";
import { registerCustomerApi } from "../services";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      avatarUrl: "",
    },
  });

  async function onSubmit(values: RegisterSchema) {
    setApiError("");
    setSubmitting(true);

    try {
      const res = await registerCustomerApi({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
        avatarUrl: values.avatarUrl?.trim() || "",
      });

      if (!res.success) {
        throw new Error(res.message || "Đăng ký thất bại");
      }

      alert("Đăng ký thành công. Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setApiError(error instanceof Error ? error.message : "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-sky-50 to-amber-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/85 p-8 shadow-2xl backdrop-blur-xl">
        <Logo />

        <div className="mt-6 space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Tạo tài khoản Customer
          </h1>
          <p className="text-sm text-slate-600">
            Đăng ký để khám phá và đặt món tại các quán ăn UGem.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-5"
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
              {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {submitting ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
        </Form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-cyan-700 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
