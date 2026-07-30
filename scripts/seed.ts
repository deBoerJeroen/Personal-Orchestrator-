/**
 * Maakt de enige gebruiker aan plus de twee standaardgebieden.
 *
 * Draaien met: `pnpm seed` (vereist SEED_USER_* in .env).
 * Idempotent: bestaat de gebruiker al, dan worden alleen ontbrekende gebieden
 * aangevuld.
 */
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { account, area, user } from "../db/schema";
import { auth } from "../lib/auth";

const email = process.env.SEED_USER_EMAIL;
const password = process.env.SEED_USER_PASSWORD;
const name = process.env.SEED_USER_NAME ?? "Ik";
/**
 * Wachtwoord vergeten of veranderen? Zet SEED_RESET_PASSWORD op `true`, vul het
 * nieuwe wachtwoord in bij SEED_USER_PASSWORD en rol opnieuw uit. Zet de vlag
 * daarna weer uit, anders wordt je wachtwoord bij elke deploy teruggezet.
 *
 * Bewust een expliciete vlag: zonder die vlag mag een deploy nooit stilletjes
 * je wachtwoord overschrijven.
 */
const resetPassword = process.env.SEED_RESET_PASSWORD === "true";

async function main() {
  if (!email || !password) {
    // Geen fout: bij een deploy waar het account al bestaat zijn deze
    // variabelen niet nodig, en dan mag de build gewoon doorlopen.
    console.log("SEED_USER_EMAIL/SEED_USER_PASSWORD niet gezet — overgeslagen.");
    return;
  }

  let [existing] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (!existing) {
    // Registratie via de API staat uit (er is maar één gebruiker), dus maken we
    // het account rechtstreeks aan met better-auth's eigen hasher.
    const ctx = await auth.$context;
    const created = await ctx.internalAdapter.createUser({ email, name, emailVerified: true });
    await ctx.internalAdapter.createAccount({
      userId: created.id,
      providerId: "credential",
      accountId: created.id,
      password: await ctx.password.hash(password),
    });

    [existing] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    console.log(`Gebruiker aangemaakt: ${email}`);
  } else if (resetPassword) {
    const ctx = await auth.$context;
    const updated = await db
      .update(account)
      .set({ password: await ctx.password.hash(password), updatedAt: new Date() })
      .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")))
      .returning({ id: account.id });

    if (updated.length === 0) {
      throw new Error("Geen wachtwoordaccount gevonden om bij te werken.");
    }

    console.log("Wachtwoord bijgewerkt. Zet SEED_RESET_PASSWORD nu weer uit.");
  } else {
    console.log(`Gebruiker bestond al: ${email}`);
  }

  if (!existing) throw new Error("Gebruiker aanmaken is mislukt.");

  const defaults = [
    { slug: "werk" as const, name: "Werk", sort: 0 },
    { slug: "prive" as const, name: "Privé", sort: 1 },
  ];

  for (const item of defaults) {
    const found = await db
      .select()
      .from(area)
      .where(and(eq(area.userId, existing.id), eq(area.slug, item.slug)))
      .limit(1);

    if (found.length === 0) {
      await db.insert(area).values({ userId: existing.id, ...item });
      console.log(`Gebied aangemaakt: ${item.name}`);
    }
  }

  console.log("Klaar. Start de app met `pnpm dev`.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
