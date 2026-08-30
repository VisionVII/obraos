import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

/**
 * Carrega o `.env` partilhado na raiz do monorepo (identificada por `pnpm-workspace.yaml`).
 * Em produção as variáveis vêm normalmente da plataforma de deploy — se a raiz não for
 * encontrada ou o ficheiro não existir, `dotenv` não faz nada e process.env fica intacto.
 */
function findMonorepoRoot(startDir: string): string | null {
  let dir = startDir;
  while (!existsSync(join(dir, "pnpm-workspace.yaml"))) {
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return dir;
}

const root = findMonorepoRoot(dirname(fileURLToPath(import.meta.url)));
if (root) config({ path: join(root, ".env") });
