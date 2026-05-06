import { useQuery } from "@tanstack/react-query";
import type { Application } from "../types";
import { getStaffApplications } from "../services/applicationService";

type ApiError = {
  response?: {
    status?: number;
  };
};

export const STAFF_APPLICATIONS_QUERY_KEY = ["admin", "applications"] as const;

export function useStaffApplications() {
  return useQuery<Application[]>({
    queryKey: STAFF_APPLICATIONS_QUERY_KEY,
    queryFn: getStaffApplications,
    retry: (failureCount, error) => {
      const apiError = error as ApiError;
      if (apiError?.response?.status === 404) return false; // Don't retry 404
      return failureCount < 3;
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60,
  });
}
