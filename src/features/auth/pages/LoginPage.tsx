import { LoginForm } from "../components/LoginForm";
import { Logo } from "./Logo";
import HeroCarousel from "../components/HeroCarousel";
import { useState } from "react";

const HERO_IMAGES = [
  "https://mia.vn/media/uploads/blog-du-lich/pho-ganh-ha-noi-01-1702697225.jpg",
  "https://static.vinwonders.com/production/bun-bo-hue-1.jpg",
  "https://bandembanhom.com/wp-content/uploads/2025/01/Com-Tam-3-Ghien-1.webp",
  "https://adormusic.s3.us-east-2.amazonaws.com/wp-content/uploads/2023/07/22045644/mi-quang-ba-mua-5-1024x1024.jpeg",
];

const CAPTIONS = [
  {
    title: "Hidden Gem miền Bắc",
    subtitle: "Phở Gánh Hàng Chiếu • 7 Chợ Gạo, Hoàn Kiếm, Hà Nội",
  },
  {
    title: "Hương vị miền Trung",
    subtitle: "Bún Bò Huế O Xuân • 5D Quang Trung, Quận 3, TP.HCM",
  },
  {
    title: "Quán ngon miền Nam",
    subtitle: "Cơm Tấm Ba Ghiền • 84 Đặng Văn Ngữ, Phú Nhuận, TP.HCM",
  },
  {
    title: "Đặc sản miền Trung",
    subtitle: "Mì Quảng Bà Mua • 19 Trần Bình Trọng, Hải Châu, Đà Nẵng",
  },
];

export function LoginPage() {
  const [slide, setSlide] = useState(0);

  function handleGoogleLogin() {
    alert(
      "Backend hiện có API đăng nhập bằng email và mật khẩu. Chưa có endpoint Google OAuth.",
    );
  }

  return (
    <main className="login-shell">
      <section className="login-hero">
        <HeroCarousel images={HERO_IMAGES} onChange={(i) => setSlide(i)} />

        <div className="hero-badge">
          <span className="badge-plate">🥗</span>

          <div>
            <strong>{CAPTIONS[slide]?.title ?? "Hidden Gem"}</strong>
            <small>{CAPTIONS[slide]?.subtitle ?? "Local favorite"}</small>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="utility-actions" aria-label="Tùy chọn nhanh">
          {/* nút chỉnh tối / sáng */}
        </div>

        <div className="login-card">
          <Logo />

          <div className="login-copy">
            <h1>Khám phá những quán ngon chưa được biết đến</h1>
            <p>
              Tìm những quán ăn địa phương ngon, chất lượng nhưng chưa được
              nhiều người biết đến.
            </p>
          </div>

          <button
            className="google-button"
            type="button"
            onClick={handleGoogleLogin}
          >
            <span className="google-g">G</span>
            Đăng nhập bằng Google
          </button>

          <div className="divider">
            <span>Hoặc</span>
          </div>

          <LoginForm />

          <button className="forgot-password" type="button">
            Quên mật khẩu?
          </button>
          <button className="register-link" type="button">
            Chưa có tài khoản? Đăng ký ngay
          </button>
        </div>

        <p className="terms">
          Bằng cách tiếp tục, bạn đồng ý với <u>điều khoản sử dụng</u> và{" "}
          <u>chính sách bảo mật</u> của UGem.
        </p>
      </section>
    </main>
  );
}
