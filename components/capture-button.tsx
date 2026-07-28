"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { capture } from "@/lib/actions";
import { copy } from "@/lib/copy";

/**
 * De belangrijkste knop van de app: vastleggen kost minder dan drie seconden
 * en nul beslissingen. Geen categorie, geen datum, geen project.
 */
export function CaptureButton() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(timer);
  }, [saved]);

  function submit(formData: FormData) {
    start(async () => {
      const result = await capture(formData);
      if (result.ok) {
        setOpen(false);
        setSaved(true);
      }
    });
  }

  return (
    <>
      {saved ? (
        <p
          role="status"
          className="fixed inset-x-0 bottom-24 z-20 mx-auto w-fit rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)]"
        >
          {copy.capture.saved}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/30 sm:items-center sm:justify-center">
          <form
            action={submit}
            className="w-full rounded-t-2xl bg-[var(--paper)] p-4 sm:max-w-md sm:rounded-2xl"
          >
            <textarea
              ref={inputRef}
              name="text"
              rows={3}
              required
              maxLength={2000}
              placeholder={copy.capture.placeholder}
              className="w-full resize-none rounded-lg border border-[var(--line)] bg-transparent p-3 text-[17px]"
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.currentTarget.form?.requestSubmit();
                }
                if (event.key === "Escape") setOpen(false);
              }}
            />
            <p className="mt-1 text-sm text-[var(--muted)]">{copy.capture.hint}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-[var(--line)] px-4"
              >
                {copy.common.cancel}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 font-medium text-white"
              >
                {copy.capture.save}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.capture.open}
        className="fixed bottom-20 right-4 z-20 h-14 w-14 rounded-full bg-[var(--color-accent)] text-2xl text-white shadow-lg"
      >
        +
      </button>
    </>
  );
}
