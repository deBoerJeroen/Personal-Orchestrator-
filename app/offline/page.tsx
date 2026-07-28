export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 text-center">
      <h1 className="text-xl font-medium">Even geen verbinding</h1>
      <p className="mt-2 text-[var(--muted)]">
        Zodra je weer online bent staat alles er weer. Je kunt nu gewoon beginnen aan wat je van plan was.
      </p>
    </main>
  );
}
