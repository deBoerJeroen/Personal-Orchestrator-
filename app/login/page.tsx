import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { logger } from "@/lib/logger";
import { getSession } from "@/lib/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.user) redirect("/nu");

  const { error } = await searchParams;

  async function signIn(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await auth.api.signInEmail({ body: { email, password }, headers: new Headers() });
    } catch (cause) {
      // Nooit e-mail of wachtwoord loggen.
      logger.warn("auth.signin.failed", { reason: cause instanceof APIError ? cause.status : "unknown" });
      redirect("/login?error=1");
    }

    redirect("/nu");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">{copy.app.name}</h1>
      <p className="mt-1 text-[var(--muted)]">{copy.app.tagline}</p>

      <form action={signIn} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--muted)]">{copy.auth.email}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="min-h-11 rounded-lg border border-[var(--line)] bg-transparent px-3"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--muted)]">{copy.auth.password}</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="min-h-11 rounded-lg border border-[var(--line)] bg-transparent px-3"
          />
        </label>

        {error ? <p className="text-sm text-[var(--color-attention)]">{copy.auth.failed}</p> : null}

        <button
          type="submit"
          className="mt-2 rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white"
        >
          {copy.auth.submit}
        </button>
      </form>
    </main>
  );
}
