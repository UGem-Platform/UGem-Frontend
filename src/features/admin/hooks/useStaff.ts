import { useQuery } from "@tanstack/react-query";
import { getStaffList, getStaffById } from "../services/staffService";

export function useStaffList() {
  return useQuery({
    queryKey: ["staff", "list"],
    queryFn: getStaffList,
  });
}

export function useStaffById(id: string) {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id),
    enabled: !!id,
  });
}
