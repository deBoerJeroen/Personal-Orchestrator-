import { MorningCheckIn } from "@/components/morning-checkin";
import { getTodayView } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OchtendPage() {
  const user = await requireUser();
  const view = await getTodayView(user.id, null);

  const suggested = [view.recommended, ...view.rest]
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .map((r) => ({ id: r.action.id, title: r.action.title }));

  return <MorningCheckIn suggested={suggested} />;
}
