import type { ApiErrorBody } from "@obraos/shared";

const BASE = `${import.meta.env.VITE_API_URL}/api/v1`;

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) { super(message); }
}

interface Options { method?: string; json?: unknown; signal?: AbortSignal }

/** Cliente HTTP único. Cookies de sessão viajam com `credentials: include`. */
export async function api<T>(path: string, { method = "GET", json, signal }: Options = {}): Promise<T> {
  const init: RequestInit = { method, credentials: "include", headers: {} };
  if (signal) init.signal = signal;
  if (json !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(json);
  }
  const res = await fetch(BASE + path, init);
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
  if (!res.ok) {
    const e = (body as ApiErrorBody | null)?.error;
    throw new ApiError(e?.code ?? "INTERNAL", e?.message ?? "Ocorreu um erro.", res.status);
  }
  return body as T;
}
