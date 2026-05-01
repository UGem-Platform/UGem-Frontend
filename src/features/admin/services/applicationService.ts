import { api } from "@/lib/axios";
import type { Application } from "../types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getStaffApplications() {
  const res = await api.get<ApiResponse<Application[]>>(
    "/Application/staff/applications",
    {
      params: {
        status: "Pending",
      },
    },
  );

  return res.data.data ?? [];
}

export async function acceptApplication(id: string) {
  const res = await api.post(`/Application/${id}/accept`);
  return res.data;
}

export async function rejectApplication(id: string, reason: string) {
  const res = await api.post("/Application/reject", {
    applicationId: id,
    note: reason,
  });

  return res.data;
}
