import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginSchema } from "../schema";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginSchema) {
    loginMutation.mutate({
      email: values.email.trim(),
      password: values.password,
    });
  }

  const apiError =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : "Đăng nhập thất bại";

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
      <label className="input-group">
        <Mail size={18} />
        <input
          type="email"
          placeholder="Email của bạn"
          autoComplete="email"
          {...register("email")}
        />
      </label>

      {errors.email?.message && (
        <p className="form-error">{errors.email.message}</p>
      )}

      <label className="input-group">
        <LockKeyhole size={18} />
        <input
          type="password"
          placeholder="Mật khẩu"
          autoComplete="current-password"
          {...register("password")}
        />
      </label>

      {errors.password?.message && (
        <p className="form-error">{errors.password.message}</p>
      )}

      {loginMutation.isError && <p className="form-error">{apiError}</p>}

      <button
        className="login-button"
        type="submit"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
