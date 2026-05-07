import { useMemo, useState } from "react";
import { ChevronRight, MapPin, Star, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Merchant } from "../types";

type Props = {
  merchant: Merchant;
  selected?: boolean;
};

function formatDistance(distanceKm: number) {
  if (distanceKm < 0.001) return "Ngay gần bạn";
  if (distanceKm < 1) return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
}

export default function MerchantCard({ merchant, selected = false }: Props) {
  const name = merchant.name || "Unnamed merchant";
  const image =
    merchant.logoUrl?.trim() ||
    merchant.menu?.find((item) => item.imageUrl?.trim())?.imageUrl?.trim() ||
    "";
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const shouldShowImage = Boolean(image) && failedImage !== image;
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return (
      parts
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "UG"
    );
  }, [name]);

  return (
    <Link
      to={`/customer/merchants/${merchant.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg border bg-white p-3 text-slate-900 shadow-sm shadow-slate-950/5 ring-1 ring-slate-950/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-950/10",
        selected
          ? "border-cyan-300 bg-cyan-50/80 shadow-cyan-950/10 ring-2 ring-cyan-200"
          : "border-slate-200/80",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1 bg-cyan-500 opacity-0 transition",
          selected ? "opacity-100" : "group-hover:opacity-100",
        )}
      />

      <div className="relative flex min-w-0 flex-col gap-3 sm:flex-row">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-cyan-50 shadow-sm shadow-slate-950/5 ring-1 ring-white/80 sm:w-32">
          {shouldShowImage ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={() => setFailedImage(image)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-cyan-800">
              <Store className="h-7 w-7" />
              <span className="text-sm font-black">{initials}</span>
            </div>
          )}

          {selected ? (
            <span className="absolute right-2 top-2 rounded-md bg-cyan-500 px-2 py-1 text-[10px] font-black uppercase text-white shadow-sm">
              Đang chọn
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-black leading-snug text-slate-950 md:text-lg">
              {name}
            </h3>

            <span className="hidden shrink-0 items-center gap-1 rounded-md bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700 transition group-hover:bg-cyan-50 group-hover:text-cyan-800 sm:inline-flex">
              Chi tiết
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>

          {merchant.description && (
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
              {merchant.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            {typeof merchant.rating === "number" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-amber-700 shadow-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {merchant.rating}
              </span>
            )}

            {typeof merchant.distance === "number" &&
              Number.isFinite(merchant.distance) && (
                <span className="rounded-md border border-cyan-100 bg-cyan-50 px-2.5 py-1.5 text-cyan-700 shadow-sm">
                  {formatDistance(merchant.distance)}
                </span>
              )}
          </div>

          {merchant.address && (
            <p className="mt-3 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-700" />
              <span className="line-clamp-1">{merchant.address}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
