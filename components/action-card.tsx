"use client";

import { useState, useTransition } from "react";
import { completeAction, dropAction, postponeAction, shrinkAction } from "@/lib/actions";
import { copy } from "@/lib/copy";
import { shrink } from "@/lib/rules/shrink";

export type ActionCardData = {
  id: string;
  title: string;
  kind: "action" | "motion";
  areaSlug: string;
  context: string | null;
  estimateMinutes: number | null;
  projectTitle: string | null;
  leadsTo: string | null;
  why?: string;
};

/**
 * De aanbevolen actie. Alles wat je hier kunt doen is gedrag: starten,
 * kleiner maken, afvinken of schrappen. Geen bewerkscherm.
 */
export function ActionCard({ data, primary = false }: { data: ActionCardData; primary?: boolean }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [shrinking, setShrinking] = useState(false);
  const [started, setStarted] = useState(false);

  const suggestion = shrink(data.title);

  function complete() {
    setConfirming(true);
    start(async () => {
      await completeAction(data.id);
      setConfirming(false);
    });
  }

  const meta = [
    data.areaSlug === "werk" ? copy.areas.werk : copy.areas.prive,
    data.context,
    data.estimateMinutes ? `${data.estimateMinutes} min` : null,
  ].filter(Boolean);

  if (!primary) {
    return (
      <li className={`flex items-center gap-3 border-b border-[var(--line)] py-3 ${confirming ? "confirming" : ""}`}>
        <button
          type="button"
          onClick={complete}
          disabled={pending}
          aria-label={`${copy.nu.done}: ${data.title}`}
          className="h-11 w-11 shrink-0 rounded-full border border-[var(--line)] text-lg"
        >
          ✓
        </button>
        <span className="flex-1 text-[17px]">{data.title}</span>
      </li>
    );
  }

  return (
    <article className={`surface rounded-2xl p-4 ${confirming ? "confirming" : ""}`}>
      <h2 className="text-xl font-medium">{data.title}</h2>

      {meta.length > 0 ? (
        <p className="mt-1 text-sm text-[var(--muted)]">{meta.join(" · ")}</p>
      ) : null}

      {data.projectTitle ? (
        <p className="mt-1 text-sm text-[var(--muted)]">{data.projectTitle}</p>
      ) : null}

      {data.kind === "motion" && data.leadsTo ? (
        <p className="mt-2 text-sm text-[var(--color-attention)]">
          Voorbereiding → {data.leadsTo}
        </p>
      ) : null}

      {data.why ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          <span className="font-medium">{copy.nu.why}:</span> {data.why}
        </p>
      ) : null}

      {started ? (
        <p role="status" className="mt-3 text-sm">
          Bezig. Zet de telefoon weg.
        </p>
      ) : null}

      {shrinking ? (
        <div className="mt-4 rounded-xl border border-[var(--line)] p-3">
          {suggestion.kind === "suggestion" ? (
            <form
              action={(formData) => {
                start(async () => {
                  await shrinkAction(formData);
                  setShrinking(false);
                });
              }}
            >
              <input type="hidden" name="id" value={data.id} />
              <input type="hidden" name="title" value={suggestion.title} />
              <p className="text-[17px]">{suggestion.title}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShrinking(false)}
                  className="flex-1 rounded-lg border border-[var(--line)] px-3"
                >
                  {copy.shrink.keep}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-lg bg-[var(--color-accent)] px-3 font-medium text-white"
                >
                  {copy.shrink.accept}
                </button>
              </div>
            </form>
          ) : (
            <form
              action={(formData) => {
                start(async () => {
                  await shrinkAction(formData);
                  setShrinking(false);
                });
              }}
            >
              <input type="hidden" name="id" value={data.id} />
              <label className="text-sm text-[var(--muted)]">{copy.shrink.ask}</label>
              <input
                name="title"
                required
                maxLength={500}
                autoFocus
                className="mt-1 min-h-11 w-full rounded-lg border border-[var(--line)] bg-transparent px-3"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShrinking(false)}
                  className="flex-1 rounded-lg border border-[var(--line)] px-3"
                >
                  {copy.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-lg bg-[var(--color-accent)] px-3 font-medium text-white"
                >
                  {copy.shrink.accept}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white"
          >
            {data.estimateMinutes ? copy.nu.startMinutes(data.estimateMinutes) : copy.nu.start}
          </button>
          <button
            type="button"
            onClick={() => setShrinking(true)}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            {copy.nu.shrink}
          </button>
          <button
            type="button"
            onClick={complete}
            disabled={pending}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            {copy.nu.done}
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-4 text-sm text-[var(--muted)]">
        <button type="button" onClick={() => start(() => void postponeAction(data.id))}>
          Later
        </button>
        <button type="button" onClick={() => start(() => void dropAction(data.id))}>
          {copy.common.notImportant}
        </button>
      </div>
    </article>
  );
}
