import { Pool } from "pg";

/**
 * Maakt de data van de testgebruiker leeg. Draait vóór elke test, want de
 * inbox is een wachtrij (oudste eerst): een restje uit een vorige test laat
 * de volgende op het verkeerde item stuklopen.
 *
 * Drie sloten om te voorkomen dat dit ooit echte data raakt: een expliciete
 * E2E_EMAIL, nooit in productie, en alleen rijen van die ene gebruiker.
 */
const TABLES = [
  "activity_event",
  "habit_log",
  "habit",
  "check_in",
  "inbox_item",
  "action",
  "project",
  "goal",
] as const;

export async function resetUserData() {
  const email = process.env.E2E_EMAIL;
  if (!email || !process.env.DATABASE_URL) return;

  if (process.env.NODE_ENV === "production") {
    throw new Error("Weiger op te schonen: NODE_ENV is production.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  try {
    const { rows } = await pool.query<{ id: string }>('SELECT id FROM "user" WHERE email = $1', [email]);
    const userId = rows[0]?.id;
    if (!userId) return;

    for (const table of TABLES) {
      await pool.query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]);
    }
  } finally {
    await pool.end();
  }
}
