"use client";

import { useTransition } from "react";
import { setMode } from "@/lib/actions";
import { copy } from "@/lib/copy";

const OPTIONS = [
  { value: "alles", label: copy.areas.all },
  { value: "werk", label: copy.areas.werk },
  { value: "prive", label: copy.areas.prive },
] as const;

/** Werk en privé scheiden kost één tap en onthoudt zichzelf. */
export function ModeSwitch({ current }: { current: string }) {
  const [pending, start] = useTransition();

  return (
    <div role="group" aria-label="Modus" className="flex gap-1 text-[15px]">
      {OPTIONS.map((option) => {
        const active = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => start(() => void setMode(option.value))}
            className={`min-h-11 rounded-full px-3 ${
              active
                ? "bg-[var(--ink)] font-medium text-[var(--paper)]"
                : "text-[var(--muted)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
