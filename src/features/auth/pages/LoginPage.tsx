import { useEffect, useRef, useState } from "react";
import { Compass, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import { LoginForm } from "../components/LoginForm";
import { getRouteByRole } from "../hooks/useLogin";
import { googleLoginApi } from "../services";
import { saveAuthToken } from "../store";
import { Logo } from "./Logo";
import { notify } from "@/shared/lib/notify";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.toString().trim() ?? "";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

const HERO_IMAGES = [
  "https://mia.vn/media/uploads/blog-du-lich/pho-ganh-ha-noi-01-1702697225.jpg",
  "https://static.vinwonders.com/production/bun-bo-hue-1.jpg",
  "https://bandembanhom.com/wp-content/uploads/2025/01/Com-Tam-3-Ghien-1.webp",
  "https://adormusic.s3.us-east-2.amazonaws.com/wp-content/uploads/2023/07/22045644/mi-quang-ba-mua-5-1024x1024.jpeg",
];

const CAPTIONS = [
  {
    title: "Hidden Gem miền Bắc",
    subtitle: "Phở Gánh Hàng Chiếu - Hà Nội",
  },
  {
    title: "Hương vị miền Trung",
    subtitle: "Bún Bò Huế O Xuân - TP.HCM",
  },
  {
    title: "Quán ngon miền Nam",
    subtitle: "Cơm Tấm Ba Ghiền - TP.HCM",
  },
  {
    title: "Đặc sản miền Trung",
    subtitle: "Mì Quảng Bà Mua - Đà Nẵng",
  },
];

export function LoginPage() {
  const [slide, setSlide] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGooglePurposeDialog, setShowGooglePurposeDialog] =
    useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  function handleGooglePurpose(path: string) {
    setShowGooglePurposeDialog(false);
    navigate(path, { replace: true });
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    function renderGoogleButton() {
      if (
        cancelled ||
        !window.google?.accounts?.id ||
        !googleButtonRef.current
      ) {
        return;
      }

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) {
            notify.error("Không nhận được Google ID token.");
            return;
          }

          setGoogleLoading(true);
          try {
            const data = await googleLoginApi({
              idToken: response.credential,
            });
            const token = data.accessToken;

            if (!token) {
              throw new Error("Không nhận được token từ server.");
            }

            const user = saveAuthToken(token);
            if (data.isNewUser && user.Role === "Customer") {
              setShowGooglePurposeDialog(true);
              return;
            }

            navigate(getRouteByRole(user.Role), { replace: true });
          } catch (error) {
            notify.error(
              error instanceof Error
                ? error.message
                : "Đăng nhập Google thất bại.",
            );
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 360,
      });
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      renderGoogleButton();
      existingScript.addEventListener("load", renderGoogleButton, {
        once: true,
      });
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", renderGoogleButton);
      };
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => notify.error("Không tải được Google Sign-In.");
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="grid min-h-screen grid-cols-1 bg-gradient-to-br from-cyan-50 via-sky-50 to-amber-50 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="relative min-h-[48vh] lg:min-h-screen">
        <HeroCarousel images={HERO_IMAGES} onChange={setSlide} />

        <div className="absolute bottom-6 left-6 z-30 max-w-sm rounded-2xl border border-white/30 bg-white/88 p-4 shadow-xl backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-100 text-sm font-black text-cyan-800">
              UG
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
          <div className="rounded-3xl border border-white/60 bg-white/85 p-8 shadow-2xl backdrop-blur-xl">
            <Logo />

            <div className="mt-6 space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Khám phá quán ăn đang bị{" "}
                <span className="text-2xl text-cyan-700">FLOP</span>
              </h1>
              <p className="text-sm text-slate-600">
                Những quán ngon địa phương chưa nhiều người biết đến
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {GOOGLE_CLIENT_ID ? (
                <div
                  className={`flex min-h-11 justify-center ${
                    googleLoading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <div ref={googleButtonRef} />
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 font-medium text-slate-400"
                >
                  Chưa cấu hình Google Client ID
                </button>
              )}
            </div>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              Hoặc
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <LoginForm />

            <div className="mt-4 space-y-1 text-center">
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

      {showGooglePurposeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <section
            aria-modal="true"
            role="dialog"
            className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Bạn muốn bắt đầu với UGem như thế nào?
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Tài khoản Google mới đã được tạo dưới vai trò Customer. Bạn có
                thể khám phá món ngon ngay hoặc gửi hồ sơ quán để được xét
                duyệt.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => handleGooglePurpose("/customer")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Compass size={18} />
                Khám phá món ngon
              </button>

              <button
                type="button"
                onClick={() =>
                  handleGooglePurpose("/merchant/application/create")
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-cyan-800"
              >
                <Store size={18} />
                Mở quán trên UGem
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
