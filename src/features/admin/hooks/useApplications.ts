import { useQuery } from "@tanstack/react-query";
import type { Application } from "../types";
import { getStaffApplications } from "../services/applicationService";

export function useStaffApplications() {
  return useQuery<Application[]>({
    queryKey: ["admin", "applications", "pending"],
    queryFn: getStaffApplications,
    refetchInterval: (query) => {
      const data = query.state.data;
      const error = query.state.error;
      // Stop polling on error or empty data
      if (error || !data || data.length === 0) return false;
      return 5000; // 5s
    },
    retry: (failureCount, error) => {
      const apiError = error as any;
      if (apiError?.response?.status === 404) return false; // Don't retry 404
      return failureCount < 3;
    },
    staleTime: 1000 * 30, // 30s
  });
}
