import { migrate } from "drizzle-orm/postgres-js/migrator";
import { adminDb, closeDb } from "./client.js";

/** Aplica as migrations SQL em ./drizzle. Única forma sancionada de alterar o schema. */
migrate(adminDb, { migrationsFolder: "./drizzle" })
  .then(async () => {
    console.warn("migrations aplicadas");
    await closeDb();
  })
  .catch(async (e) => {
    console.error(e);
    await closeDb();
    process.exit(1);
  });
