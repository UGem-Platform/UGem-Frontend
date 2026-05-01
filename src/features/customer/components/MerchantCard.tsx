import { Link } from "react-router-dom";
import type { Merchant } from "../types";

type Props = {
  merchant: Merchant;
};

export default function MerchantCard({ merchant }: Props) {
  const name = merchant.name || "Unnamed merchant";
  const image =
    merchant.logoUrl || merchant.menu?.[0]?.imageUrl;

  return (
    <Link
      to={`/customer/merchants/${merchant.id}`}
      className="block rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold leading-snug">{name}</h3>

          {merchant.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {merchant.description}
            </p>
          )}

          <div className="mt-2 flex gap-3 text-sm text-muted-foreground">
            {typeof merchant.rating === "number" && (
              <span>⭐ {merchant.rating}</span>
            )}
            {typeof merchant.distance === "number" &&
              Number.isFinite(merchant.distance) && (
                <span>{merchant.distance.toFixed(1)} km</span>
              )}
          </div>

          {merchant.address && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {merchant.address}
            </p>
          )}

          {typeof merchant.rating === "number" && (
            <p className="mt-1 text-xs text-muted-foreground">
              ⭐ {merchant.rating}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
