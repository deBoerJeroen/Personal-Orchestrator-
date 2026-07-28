/**
 * Zet het databaseschema klaar. Draait automatisch bij elke deploy en is
 * veilig om vaker uit te voeren: al uitgevoerde migraties worden overgeslagen.
 */
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../db";

async function main() {
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("Database is bijgewerkt.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Database bijwerken is mislukt:", error);
    process.exit(1);
  });
