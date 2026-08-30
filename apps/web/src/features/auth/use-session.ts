import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginInput, SessionUser } from "@obraos/shared";
import { api } from "@/shared/api/http";

const KEY = ["session"];

export function useSession() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api<{ user: SessionUser }>("/auth/me").then((r) => r.user).catch(() => null),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api<{ user: SessionUser }>("/auth/login", { method: "POST", json: input }),
    onSuccess: ({ user }) => qc.setQueryData(KEY, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    onSuccess: () => qc.setQueryData(KEY, null),
  });
}
