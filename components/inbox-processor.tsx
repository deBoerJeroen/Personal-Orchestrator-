"use client";

import { useState, useTransition } from "react";
import { processInboxItem } from "@/lib/actions";
import { copy } from "@/lib/copy";
import { analyseTitle } from "@/lib/rules/motion";

type Step = "outcome" | "actionable" | "multiStep" | "nextAction" | "motion" | "twoMinutes" | "area";

/**
 * GTD clarify: één vraag per scherm. Verwerken moet snel voelen, dus nooit
 * twee beslissingen tegelijk en nooit meer dan vier knoppen.
 */
export function InboxProcessor({
  item,
  index,
  total,
}: {
  item: { id: string; rawText: string };
  index: number;
  total: number;
}) {
  const [step, setStep] = useState<Step>("outcome");
  const [outcome, setOutcome] = useState("");
  const [isProject, setIsProject] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [leadsTo, setLeadsTo] = useState("");
  const [pending, start] = useTransition();

  const hint = analyseTitle(item.rawText);
  const actionHint = analyseTitle(actionTitle || item.rawText);

  function submit(fields: Record<string, string>) {
    const formData = new FormData();
    formData.set("itemId", item.id);
    for (const [key, value] of Object.entries(fields)) {
      if (value) formData.set(key, value);
    }
    start(async () => {
      await processInboxItem(formData);
      setStep("outcome");
      setOutcome("");
      setActionTitle("");
      setLeadsTo("");
      setIsProject(false);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">{copy.inbox.progress(index, total)}</p>

      <blockquote className="surface rounded-2xl p-4 text-xl">{item.rawText}</blockquote>

      {step === "outcome" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep("actionable");
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor="outcome" className="font-medium">
            {copy.inbox.outcome}
          </label>
          <input
            id="outcome"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            placeholder={copy.inbox.outcomePlaceholder}
            autoFocus
            className="min-h-11 rounded-lg border border-[var(--line)] bg-transparent px-3"
          />
          <button type="submit" className="rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white">
            {copy.common.next}
          </button>
        </form>
      ) : null}

      {step === "actionable" ? (
        <div className="flex flex-col gap-3">
          <p className="font-medium">{copy.inbox.actionable}</p>
          <button
            type="button"
            onClick={() => setStep("multiStep")}
            className="rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white"
          >
            {copy.inbox.yes}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit({ decision: "someday" })}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            {copy.inbox.noSomeday}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit({ decision: "reference" })}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            {copy.inbox.noReference}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit({ decision: "drop" })}
            className="rounded-lg border border-[var(--line)] px-4 text-[var(--muted)]"
          >
            {copy.inbox.noDrop}
          </button>
        </div>
      ) : null}

      {step === "multiStep" ? (
        <div className="flex flex-col gap-3">
          <p className="font-medium">{copy.inbox.multiStep}</p>
          {hint.looksVague ? (
            <p className="text-sm text-[var(--muted)]">
              Dit klinkt als meer dan één stap. {copy.intervention.suggestion}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setIsProject(true);
              setStep("nextAction");
            }}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            {copy.inbox.yes}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsProject(false);
              setStep("nextAction");
            }}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            Nee, één actie
          </button>
        </div>
      ) : null}

      {step === "nextAction" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep(analyseTitle(actionTitle).looksLikeMotion ? "motion" : "twoMinutes");
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor="actionTitle" className="font-medium">
            {copy.inbox.nextAction}
          </label>
          <p className="text-sm text-[var(--muted)]">{copy.inbox.nextActionHint}</p>
          <input
            id="actionTitle"
            value={actionTitle}
            onChange={(event) => setActionTitle(event.target.value)}
            required
            autoFocus
            className="min-h-11 rounded-lg border border-[var(--line)] bg-transparent px-3"
          />
          <button type="submit" className="rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white">
            {copy.common.next}
          </button>
        </form>
      ) : null}

      {step === "motion" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep("twoMinutes");
          }}
          className="flex flex-col gap-3"
        >
          <p className="font-medium">{copy.inbox.motionCheck}</p>
          <p className="text-sm text-[var(--muted)]">
            {actionHint.matched ? `Herkend aan "${actionHint.matched}". ` : ""}
            {copy.intervention.suggestion}
          </p>
          <label htmlFor="leadsTo" className="text-sm">
            {copy.inbox.motionLeadsTo}
          </label>
          <input
            id="leadsTo"
            value={leadsTo}
            onChange={(event) => setLeadsTo(event.target.value)}
            placeholder={copy.inbox.motionLeadsToPlaceholder}
            autoFocus
            className="min-h-11 rounded-lg border border-[var(--line)] bg-transparent px-3"
          />
          <button type="submit" className="rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white">
            {copy.common.next}
          </button>
          <button
            type="button"
            onClick={() => {
              setLeadsTo("");
              setStep("twoMinutes");
            }}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            Nee, dit is echt werk
          </button>
        </form>
      ) : null}

      {step === "twoMinutes" ? (
        <div className="flex flex-col gap-3">
          <p className="font-medium">{copy.inbox.twoMinutes}</p>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              submit({
                decision: "done_now",
                actionTitle,
                outcome,
                area: "prive",
                kind: leadsTo ? "motion" : "action",
                leadsTo,
              })
            }
            className="rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white"
          >
            {copy.inbox.twoMinutesDoNow}
          </button>
          <button
            type="button"
            onClick={() => setStep("area")}
            className="rounded-lg border border-[var(--line)] px-4"
          >
            Nee
          </button>
        </div>
      ) : null}

      {step === "area" ? (
        <div className="flex flex-col gap-3">
          <p className="font-medium">{copy.inbox.area}</p>
          {(["werk", "prive"] as const).map((areaSlug) => (
            <button
              key={areaSlug}
              type="button"
              disabled={pending}
              onClick={() =>
                submit({
                  decision: isProject ? "project" : "action",
                  area: areaSlug,
                  outcome,
                  actionTitle,
                  kind: leadsTo ? "motion" : "action",
                  leadsTo,
                })
              }
              className="rounded-lg border border-[var(--line)] px-4"
            >
              {areaSlug === "werk" ? copy.areas.werk : copy.areas.prive}
            </button>
          ))}
          <p className="text-sm text-[var(--muted)]">{copy.inbox.deadlineHint}</p>
        </div>
      ) : null}
    </div>
  );
}
