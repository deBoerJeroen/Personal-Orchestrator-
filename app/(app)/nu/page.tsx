import Link from "next/link";
import { cookies } from "next/headers";
import { ActionCard, type ActionCardData } from "@/components/action-card";
import { copy } from "@/lib/copy";
import { getTodayView, type Mode } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Ranked = NonNullable<Awaited<ReturnType<typeof getTodayView>>["recommended"]>;

function toCardData(ranked: Ranked, includeWhy: boolean): ActionCardData {
  const { action } = ranked;
  return {
    id: action.id,
    title: action.title,
    kind: action.kind,
    areaSlug: action.areaSlug,
    context: action.context,
    estimateMinutes: action.estimateMinutes,
    projectTitle: action.projectTitle,
    leadsTo: action.leadsTo,
    why: includeWhy ? ranked.why : undefined,
  };
}

export default async function NuPage() {
  const user = await requireUser();
  const store = await cookies();
  const modeCookie = store.get("nu.mode")?.value;
  const mode: Mode = modeCookie === "werk" || modeCookie === "prive" ? modeCookie : null;

  const view = await getTodayView(user.id, mode);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          {copy.nu.heading}
        </h1>

        {view.recommended ? (
          <ActionCard data={toCardData(view.recommended, true)} primary />
        ) : (
          <p className="text-[var(--muted)]">{copy.nu.empty}</p>
        )}
      </section>

      {view.rest.length > 0 ? (
        <section>
          <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
            {copy.nu.next} ({view.rest.length})
          </h2>
          <ul>
            {view.rest.map((ranked) => (
              <ActionCard key={ranked.action.id} data={toCardData(ranked, false)} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex gap-3">
        {!view.morningDone ? (
          <Link
            href="/checkin/ochtend"
            className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[var(--line)] px-4"
          >
            {copy.nu.morningCheckin}
          </Link>
        ) : null}
        <Link
          href="/checkin/avond"
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[var(--line)] px-4"
        >
          {copy.nu.closeDay}
        </Link>
      </section>
    </div>
  );
}
