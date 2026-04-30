import { useQuery } from "@tanstack/react-query";
import { getReviewById, getReviews } from "./services";

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: getReviews,
  });
}

export function useReviewById(id: string) {
  return useQuery({
    queryKey: ["review", id],
    queryFn: () => getReviewById(id),
    enabled: !!id,
  });
}
