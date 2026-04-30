import { api } from "@/lib/axios";

export type WishlistItem = {
  merchantId?: string;
  id?: string;
  name: string;
  logoUrl: string;
  rating: number;
};

export async function getWishlist() {
  const res = await api.get<WishlistItem[]>("/Wishlist");
  return res.data;
}

export async function addWishlist(merchantId: string) {
  const res = await api.post("/Wishlist", {
    merchantId,
  });

  return res.data;
}

export async function removeWishlist(merchantId: string) {
  const res = await api.delete(`/Wishlist/${merchantId}`);
  return res.data;
}
