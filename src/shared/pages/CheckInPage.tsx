import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { api } from "@/lib/axios";

export default function CheckInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function verifyCheckIn() {
      try {
        await api.post("/check-in/verify");

        if (!active) return;

        setMessage("Check-in thanh cong.");
        setStatus("success");
      } catch (error) {
        console.error(error);

        if (!active) return;

        setMessage("Khong the ghi nhan check-in. Vui long thu lai.");
        setStatus("error");
      }
    }

    const user = getCurrentUser();
    if (!user) {
      const returnPath = orderId ? `/check-in?orderId=${orderId}` : "/check-in";
      const returnUrl = encodeURIComponent(returnPath);
      navigate(`/login?returnUrl=${returnUrl}`, { replace: true });
      return;
    }

    void verifyCheckIn();

    return () => {
      active = false;
    };
  }, [orderId, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-black text-slate-950">
              Check-in thanh cong
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Cam on ban da den. Check-in cua ban da duoc ghi nhan.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-black text-slate-950">
              Khong the check-in
            </h1>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white transition hover:bg-cyan-800"
              onClick={() => {
                const returnPath = orderId
                  ? `/check-in?orderId=${orderId}`
                  : "/check-in";
                const returnUrl = encodeURIComponent(returnPath);
                navigate(`/login?returnUrl=${returnUrl}`);
              }}
            >
              Dang nhap de thu lai
            </button>
          </>
        )}

        {status === "idle" && (
          <p className="text-sm text-slate-600">Dang chuan bi check-in...</p>
        )}
      </section>
    </main>
  );
}
