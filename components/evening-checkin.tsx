"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveCheckIn } from "@/lib/actions";
import { copy } from "@/lib/copy";

/**
 * Alles is optioneel en alles is overslaanbaar. Een gemiste avondcheck-in
 * heeft nul gevolgen — dat is een ontwerpeis, geen coulance.
 */
const QUESTIONS = [
  { name: "done", label: copy.checkin.doneToday },
  { name: "motion", label: copy.checkin.motionToday },
  { name: "letGo", label: copy.checkin.letGo },
  { name: "tomorrow", label: copy.checkin.tomorrow },
] as const;

export function EveningCheckIn() {
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    formData.set("kind", "evening");
    start(async () => {
      await saveCheckIn(formData);
      router.push("/nu");
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium">{copy.checkin.eveningTitle}</h1>
        <p className="text-sm text-[var(--muted)]">{copy.checkin.optional}</p>
      </div>

      {QUESTIONS.map((question) => (
        <label key={question.name} className="flex flex-col gap-1">
          <span>{question.label}</span>
          <textarea
            name={`answer.${question.name}`}
            rows={2}
            className="resize-none rounded-lg border border-[var(--line)] bg-transparent p-3"
          />
        </label>
      ))}

      <p className="text-sm text-[var(--muted)]">
        De laatste vraag wordt morgen automatisch een actie.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => router.push("/nu")}
          className="flex-1 rounded-lg border border-[var(--line)] px-4"
        >
          {copy.checkin.skip}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white"
        >
          {copy.checkin.finish}
        </button>
      </div>
    </form>
  );
}
