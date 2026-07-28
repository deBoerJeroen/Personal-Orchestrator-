import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL ontbreekt. Kopieer .env.example naar .env — zie README.");
}

/**
 * Eén standaard Postgres-driver, zodat dezelfde code werkt tegen Neon én tegen
 * een database op je eigen machine. Gebruik op Neon de *pooled* connection
 * string (die met `-pooler` erin): serverless functies openen veel korte
 * verbindingen.
 *
 * De pool wordt op de globale scope bewaard, anders maakt elke hot reload in
 * ontwikkeling een nieuwe pool aan tot Postgres de verbindingen weigert.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
