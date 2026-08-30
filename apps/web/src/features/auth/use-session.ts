import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ChangePasswordInput, ForgotPasswordInput, LoginInput, RegisterInput, ResendVerificationInput,
  ResetPasswordInput, SessionUser, VerifyEmailInput,
} from "@obraos/shared";
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

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => api<{ user: SessionUser }>("/auth/register", { method: "POST", json: input }),
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

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => api<void>("/auth/password/forgot", { method: "POST", json: input }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => api<void>("/auth/password/reset", { method: "POST", json: input }),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) => api<void>("/auth/email/verify", { method: "POST", json: input }),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (input: ResendVerificationInput) => api<void>("/auth/email/resend", { method: "POST", json: input }),
  });
}

export function useChangePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => api<{ user: SessionUser }>("/auth/password/change", { method: "POST", json: input }),
    onSuccess: ({ user }) => qc.setQueryData(KEY, user),
  });
}
