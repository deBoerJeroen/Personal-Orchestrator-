"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveCheckIn } from "@/lib/actions";
import { copy } from "@/lib/copy";

/** Drie schermen, drie taps, klaar binnen een minuut. */
export function MorningCheckIn({ suggested }: { suggested: { id: string; title: string }[] }) {
  const [step, setStep] = useState<"energy" | "mode" | "focus">("energy");
  const [energy, setEnergy] = useState<number | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function finish() {
    const formData = new FormData();
    formData.set("kind", "morning");
    if (energy) formData.set("energy", String(energy));
    if (mode) formData.set("mode", mode);

    start(async () => {
      await saveCheckIn(formData);
      router.push("/nu");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-medium">{copy.checkin.morningTitle}</h1>

      {step === "energy" ? (
        <section className="flex flex-col gap-3">
          <p>{copy.checkin.energy}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  setEnergy(level);
                  setStep("mode");
                }}
                className="min-h-14 flex-1 rounded-lg border border-[var(--line)] text-lg"
              >
                {level}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === "mode" ? (
        <section className="flex flex-col gap-3">
          <p>{copy.checkin.mode}</p>
          {[
            { value: "werk", label: copy.checkin.modeWork },
            { value: "prive", label: copy.checkin.modePrivate },
            { value: "beide", label: copy.checkin.modeBoth },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setMode(option.value);
                setStep("focus");
              }}
              className="rounded-lg border border-[var(--line)] px-4"
            >
              {option.label}
            </button>
          ))}
        </section>
      ) : null}

      {step === "focus" ? (
        <section className="flex flex-col gap-3">
          <p>{copy.checkin.focus}</p>
          <ul className="flex flex-col gap-2">
            {suggested.length > 0 ? (
              suggested.map((item) => (
                <li key={item.id} className="surface rounded-lg p-3 text-[17px]">
                  {item.title}
                </li>
              ))
            ) : (
              <li className="text-[var(--muted)]">{copy.nu.emptyFocus}</li>
            )}
          </ul>
          <button
            type="button"
            disabled={pending}
            onClick={finish}
            className="rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white"
          >
            {copy.checkin.finish}
          </button>
        </section>
      ) : null}
    </div>
  );
}
