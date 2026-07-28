import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import * as s from "@/db/schema";
import { logger } from "@/lib/logger";
import { getSession } from "@/lib/session";

/**
 * Volledige export van alle eigen data. Vanaf dag één, niet later:
 * als je er niet uit kunt, zit je vast.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = session.user.id;

  const [areas, goals, projects, actions, inbox, checkIns, events, identities, habits, habitLogs] =
    await Promise.all([
      db.select().from(s.area).where(eq(s.area.userId, userId)),
      db.select().from(s.goal).where(eq(s.goal.userId, userId)),
      db.select().from(s.project).where(eq(s.project.userId, userId)),
      db.select().from(s.action).where(eq(s.action.userId, userId)),
      db.select().from(s.inboxItem).where(eq(s.inboxItem.userId, userId)),
      db.select().from(s.checkIn).where(eq(s.checkIn.userId, userId)),
      db.select().from(s.activityEvent).where(eq(s.activityEvent.userId, userId)),
      db.select().from(s.identity).where(eq(s.identity.userId, userId)),
      db.select().from(s.habit).where(eq(s.habit.userId, userId)),
      db.select().from(s.habitLog).where(eq(s.habitLog.userId, userId)),
    ]);

  logger.info("export.created", { userId, actions: actions.length, checkIns: checkIns.length });

  const payload = {
    exportedAt: new Date().toISOString(),
    user: { id: userId, email: session.user.email, name: session.user.name },
    areas,
    goals,
    projects,
    actions,
    inbox,
    checkIns,
    events,
    identities,
    habits,
    habitLogs,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="nu-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
