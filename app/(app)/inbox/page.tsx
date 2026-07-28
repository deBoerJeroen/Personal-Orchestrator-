import { InboxProcessor } from "@/components/inbox-processor";
import { copy } from "@/lib/copy";
import { getOpenInbox } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const user = await requireUser();
  const items = await getOpenInbox(user.id);
  const current = items[0];

  if (!current) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-[var(--muted)]">{copy.inbox.empty}</p>
      </div>
    );
  }

  return <InboxProcessor item={{ id: current.id, rawText: current.rawText }} index={1} total={items.length} />;
}
