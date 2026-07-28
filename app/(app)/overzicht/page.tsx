import { cookies } from "next/headers";
import { copy } from "@/lib/copy";
import { getOverview, type Mode } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function Section({
  title,
  count,
  children,
  open = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="border-b border-[var(--line)] py-3">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between text-[17px]">
        <span>{title}</span>
        <span className="text-[var(--muted)]">{count}</span>
      </summary>
      <div className="pt-2">{children}</div>
    </details>
  );
}

export default async function OverzichtPage() {
  const user = await requireUser();
  const store = await cookies();
  const modeCookie = store.get("nu.mode")?.value;
  const mode: Mode = modeCookie === "werk" || modeCookie === "prive" ? modeCookie : null;

  const { goals, projects, nextActions, waiting, someday } = await getOverview(user.id, mode);
  const isEmpty = goals.length + projects.length + nextActions.length === 0;

  if (isEmpty) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-[var(--muted)]">{copy.overzicht.empty}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        {copy.overzicht.heading}
      </h1>

      <Section title={copy.overzicht.goals} count={goals.length}>
        <ul className="flex flex-col gap-2">
          {goals.map((g) => (
            <li key={g.id} className="text-[17px]">
              {g.title}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.overzicht.projects} count={projects.length} open>
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <li key={p.id} className="flex items-start gap-2 text-[17px]">
              {!p.hasNextAction ? (
                <span
                  aria-label={copy.overzicht.noNextAction}
                  title={copy.overzicht.noNextAction}
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-attention)]"
                />
              ) : (
                <span className="mt-2 h-2 w-2 shrink-0" />
              )}
              <span>
                {p.title}
                {!p.hasNextAction ? (
                  <span className="block text-sm text-[var(--color-attention)]">
                    {copy.overzicht.noNextAction}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.overzicht.actions} count={nextActions.length}>
        <ul className="flex flex-col gap-2">
          {nextActions.map((a) => (
            <li key={a.id} className="text-[17px]">
              {a.title}
              {a.kind === "motion" ? (
                <span className="ml-2 text-sm text-[var(--color-attention)]">voorbereiding</span>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.overzicht.waiting} count={waiting.length}>
        <ul className="flex flex-col gap-2">
          {waiting.map((a) => (
            <li key={a.id} className="text-[17px]">
              {a.title}
              {a.waitingOn ? <span className="text-[var(--muted)]"> — {a.waitingOn}</span> : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.overzicht.someday} count={someday.length}>
        <ul className="flex flex-col gap-2">
          {someday.map((item) => (
            <li key={item.id} className="text-[17px] text-[var(--muted)]">
              {item.title}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
