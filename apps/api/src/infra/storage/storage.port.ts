/**
 * Porta de armazenamento de ficheiros (S3-compatible).
 * O banco guarda só metadados; ficheiros privados saem via signed URLs.
 * Implementação real entra na FASE 3 (Field). Manter esta interface estável.
 */
export interface StoragePort {
  getUploadUrl(key: string, contentType: string, ttlSeconds?: number): Promise<string>;
  getDownloadUrl(key: string, ttlSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

/** Chaves são sempre prefixadas pelo tenant: nunca é possível adivinhar chaves de outra org. */
export const storageKey = (organizationId: string, kind: "photos" | "documents" | "avatars" | "reports", id: string, ext: string) =>
  `${kind}/${organizationId}/${id}.${ext}`;
