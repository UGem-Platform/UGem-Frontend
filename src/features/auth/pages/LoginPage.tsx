import { LoginForm } from "../components/LoginForm";
import { Logo } from "./Logo";
import HeroCarousel from "../components/HeroCarousel";
import { useState } from "react";
import { Link } from "react-router-dom";

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

export function LoginPage() {
  const [slide, setSlide] = useState(0);
  function handleGoogleLogin() {
    alert("Chưa có Google OAuth backend");
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-gradient-to-br from-cyan-50 via-sky-50 to-amber-50 lg:grid-cols-[1.2fr_0.8fr]">
      {/* LEFT - HERO */}
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

      {/* RIGHT - LOGIN */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white/85 p-8 shadow-2xl backdrop-blur-xl border border-white/60">
            <Logo />

            <div className="mt-6 space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Khám phá quán ăn đang bị{" "}
                <span className="text-cyan-700 text-2xl">FLOP</span>
              </h1>
              <p className="text-sm text-slate-600">
                Những quán ngon địa phương chưa nhiều người biết đến
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-medium hover:bg-cyan-50"
            >
              <span className="text-cyan-600 font-bold">
                <img
                  src="https://static.dezeen.com/uploads/2025/05/sq-google-g-logo-update_dezeen_2364_col_0.jpg"
                  alt="Google Logo"
                  className="h-6 w-6"
                />
              </span>
              Đăng nhập bằng Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              Hoặc
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <LoginForm />

            <div className="mt-4 text-center space-y-1">
              <button className="text-sm text-cyan-700 hover:underline">
                Quên mật khẩu?
              </button>
              <Link
                to="/register"
                className="block text-sm font-medium text-amber-700 hover:underline"
              >
                Chưa có tài khoản? Đăng ký
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Bằng cách tiếp tục, bạn đồng ý điều khoản & chính sách
          </p>
        </div>
      </section>
    </main>
  );
}
