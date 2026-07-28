import { EveningCheckIn } from "@/components/evening-checkin";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AvondPage() {
  await requireUser();
  return <EveningCheckIn />;
}
