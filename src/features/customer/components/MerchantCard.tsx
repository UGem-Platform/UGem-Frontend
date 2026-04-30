import { Link } from "react-router-dom";
import type { Merchant } from "../types";

type Props = {
  merchant: Merchant;
};

export default function MerchantCard({ merchant }: Props) {
  const name = merchant.name || merchant.merchantName || "Unnamed merchant";
  const image = merchant.logoUrl || merchant.imageUrl;

  return (
    <Link
      to={`/customer/merchants/${merchant.id}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="flex gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>

          {merchant.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {merchant.description}
            </p>
          )}

          <div className="mt-2 flex gap-3 text-sm text-gray-600">
            {merchant.rating && <span>⭐ {merchant.rating}</span>}
            {merchant.distance && (
              <span>{merchant.distance.toFixed(1)} km</span>
            )}
          </div>

          {merchant.address && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-400">
              {merchant.address}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
