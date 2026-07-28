import { cookies } from "next/headers";
import { CaptureButton } from "@/components/capture-button";
import { ModeSwitch } from "@/components/mode-switch";
import { TabBar } from "@/components/tab-bar";
import { getInboxCount } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const store = await cookies();
  const mode = store.get("nu.mode")?.value ?? "alles";
  const inboxCount = await getInboxCount(user.id);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 pt-4">
        <ModeSwitch current={mode} />
      </header>

      <main className="flex-1 px-4 pb-32 pt-4">{children}</main>

      <CaptureButton />
      <TabBar inboxCount={inboxCount} />
    </div>
  );
}
