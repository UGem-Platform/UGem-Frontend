import { useQuery } from "@tanstack/react-query";
import { getStaffMerchantList } from "../services/merchantService";

export function useStaffMerchantList(params: {
  searchTerm?: string;
  pageIndex: number;
  pageSize: number;
}) {
  return useQuery({
    queryKey: [
      "staff",
      "merchants",
      params.searchTerm ?? "",
      params.pageIndex,
      params.pageSize,
    ],
    queryFn: () => getStaffMerchantList(params),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}
