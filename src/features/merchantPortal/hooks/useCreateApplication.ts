import { useMutation } from "@tanstack/react-query";
import { createMerchantApplication } from "../services";

export function useCreateApplication() {
  return useMutation({
    mutationFn: createMerchantApplication,
  });
}
