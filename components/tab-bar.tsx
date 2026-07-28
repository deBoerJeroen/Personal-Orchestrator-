"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/lib/copy";

/** Drie tabs. Meer niet — elk extra tabblad is een plek om te wonen. */
const TABS = [
  { href: "/nu", label: copy.nav.nu },
  { href: "/inbox", label: copy.nav.inbox },
  { href: "/overzicht", label: copy.nav.overzicht },
] as const;

export function TabBar({ inboxCount }: { inboxCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--line)] bg-[var(--paper)] pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-2xl">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 items-center justify-center gap-1.5 text-[15px] ${
                  active ? "font-semibold text-[var(--ink)]" : "text-[var(--muted)]"
                }`}
              >
                {tab.label}
                {tab.href === "/inbox" && inboxCount > 0 ? (
                  <span className="rounded-full bg-[var(--color-accent)] px-1.5 text-xs font-medium text-white">
                    {inboxCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
