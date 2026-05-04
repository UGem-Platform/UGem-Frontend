import { useMemo, useState } from "react";
import { MapPin, Star, Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Merchant } from "../types";

type Props = {
  merchant: Merchant;
};

function formatDistance(distanceKm: number) {
  if (distanceKm < 0.001) return "Ngay gần bạn";
  if (distanceKm < 1) return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
}

export default function MerchantCard({ merchant }: Props) {
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
      className="block rounded-xl border border-cyan-100/80 bg-card p-3 text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
    >
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-cyan-100 via-sky-50 to-amber-100">
          {shouldShowImage ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
              onError={() => setFailedImage(image)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-cyan-800">
              <Store className="h-6 w-6" />
              <span className="text-xs font-black">{initials}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">{name}</h3>

          {merchant.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {merchant.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {typeof merchant.rating === "number" && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {merchant.rating}
              </span>
            )}
            {typeof merchant.distance === "number" &&
              Number.isFinite(merchant.distance) && (
                <span>{formatDistance(merchant.distance)}</span>
              )}
          </div>

          {merchant.address && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{merchant.address}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
