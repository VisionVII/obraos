import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Client, CreateClientInput, UpdateClientInput } from "@obraos/shared";
import { api } from "@/shared/api/http";

const KEY = ["clients"];

export function useClients() {
  return useQuery({ queryKey: KEY, queryFn: () => api<Client[]>("/clients") });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => api<Client>(`/clients/${id}`),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => api<Client>("/clients", { method: "POST", json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY, exact: true }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClientInput) => api<Client>(`/clients/${id}`, { method: "PATCH", json: input }),
    onSuccess: (data) => {
      qc.setQueryData([...KEY, id], data);
      qc.invalidateQueries({ queryKey: KEY, exact: true });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/clients/${id}`, { method: "DELETE" }),
    // queryKey: KEY faz match por prefixo — sem `exact`, invalidaria também a query de
    // detalhe do cliente acabado de eliminar, causando um refetch em 404.
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: [...KEY, id] });
      qc.invalidateQueries({ queryKey: KEY, exact: true });
    },
  });
}
