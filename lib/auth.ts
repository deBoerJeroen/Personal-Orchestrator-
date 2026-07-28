import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

/**
 * Eén gebruiker. Geen registratieroute: het account wordt aangemaakt met
 * `pnpm seed`. Wie niet is ingelogd komt nergens.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Bewust uit: er is geen tweede gebruiker die zich kan aanmelden.
    disableSignUp: true,
  },
  session: {
    // Lange sessie: elke week opnieuw inloggen is frictie zonder opbrengst
    // wanneer je de enige gebruiker bent.
    expiresIn: 60 * 60 * 24 * 90,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      timezone: { type: "string", required: false, defaultValue: "Europe/Amsterdam", input: false },
      dayBoundaryHour: { type: "number", required: false, defaultValue: 4, input: false },
    },
  },
  advanced: {
    cookiePrefix: "nu",
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
