import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "../services";

export function useMyApplications() {
  return useQuery({
    queryKey: ["merchant-portal", "my-applications"],
    queryFn: getMyApplications,
  });
}
