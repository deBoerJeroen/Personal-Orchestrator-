import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { action, area, checkIn, goal, inboxItem, project } from "@/db/schema";
import { logicalDay } from "./rules/day";
import { rankActions, selectFocus, type RankableAction, type RankedAction } from "./rules/rank";

export type Mode = "werk" | "prive" | null;

export async function getAreas(userId: string) {
  return db
    .select()
    .from(area)
    .where(and(eq(area.userId, userId), isNull(area.archivedAt)))
    .orderBy(asc(area.sort));
}

export async function getAreaBySlug(userId: string, slug: "werk" | "prive") {
  const rows = await db
    .select()
    .from(area)
    .where(and(eq(area.userId, userId), eq(area.slug, slug)))
    .limit(1);
  return rows[0] ?? null;
}

/** Alle acties die nú gedaan kunnen worden, inclusief hun ranking. */
export async function getActionableActions(userId: string, mode: Mode, now = new Date()) {
  const rows = await db
    .select({
      id: action.id,
      title: action.title,
      kind: action.kind,
      context: action.context,
      estimateMinutes: action.estimateMinutes,
      energy: action.energy,
      dueAt: action.dueAt,
      scheduledFor: action.scheduledFor,
      postponedCount: action.postponedCount,
      leadsTo: action.leadsTo,
      projectId: action.projectId,
      projectTitle: project.title,
      areaSlug: area.slug,
      goalStatus: goal.status,
      createdAt: action.createdAt,
    })
    .from(action)
    .innerJoin(area, eq(action.areaId, area.id))
    .leftJoin(project, eq(action.projectId, project.id))
    .leftJoin(goal, eq(project.goalId, goal.id))
    .where(
      and(
        eq(action.userId, userId),
        inArray(action.status, ["next", "scheduled"]),
        isNull(action.archivedAt),
      ),
    )
    .orderBy(asc(action.createdAt));

  const today = logicalDay(now);

  const rankable: ActionWithMeta[] = rows.map(
    (row) => ({
      id: row.id,
      title: row.title,
      kind: row.kind,
      areaSlug: row.areaSlug,
      context: row.context,
      estimateMinutes: row.estimateMinutes,
      energy: row.energy,
      dueAt: row.dueAt,
      scheduledFor: row.scheduledFor,
      postponedCount: row.postponedCount,
      supportsActiveGoal: row.goalStatus === "active",
      projectTitle: row.projectTitle,
      leadsTo: row.leadsTo,
    }),
  );

  const filtered = mode ? rankable.filter((a) => a.areaSlug === mode) : rankable;
  const ranked = rankActions(filtered, { now, mode, today });

  return { ranked, today };
}

/** De actie zoals het Nu-scherm hem nodig heeft: ranking plus wat context. */
export type ActionWithMeta = RankableAction & {
  projectTitle: string | null;
  leadsTo: string | null;
};

export type TodayView = {
  recommended: RankedAction<ActionWithMeta> | null;
  rest: RankedAction<ActionWithMeta>[];
  totalOpen: number;
  today: string;
  morningDone: boolean;
  eveningDone: boolean;
};

export async function getTodayView(userId: string, mode: Mode, now = new Date()): Promise<TodayView> {
  const { ranked, today } = await getActionableActions(userId, mode, now);
  const focus = selectFocus(ranked);

  const checkIns = await db
    .select({ kind: checkIn.kind, completedAt: checkIn.completedAt })
    .from(checkIn)
    .where(and(eq(checkIn.userId, userId), eq(checkIn.date, today)));

  return {
    recommended: focus[0] ?? null,
    rest: focus.slice(1),
    totalOpen: ranked.length,
    today,
    morningDone: checkIns.some((c) => c.kind === "morning" && c.completedAt !== null),
    eveningDone: checkIns.some((c) => c.kind === "evening" && c.completedAt !== null),
  };
}

export async function getOpenInbox(userId: string) {
  return db
    .select()
    .from(inboxItem)
    .where(and(eq(inboxItem.userId, userId), eq(inboxItem.status, "open"), isNull(inboxItem.archivedAt)))
    .orderBy(asc(inboxItem.capturedAt));
}

export async function getInboxCount(userId: string) {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(inboxItem)
    .where(and(eq(inboxItem.userId, userId), eq(inboxItem.status, "open"), isNull(inboxItem.archivedAt)));
  return rows[0]?.count ?? 0;
}

export type OverviewProject = {
  id: string;
  title: string;
  areaSlug: string;
  status: string;
  dueAt: Date | null;
  openActions: number;
  hasNextAction: boolean;
};

export async function getOverview(userId: string, mode: Mode) {
  const goals = await db
    .select({
      id: goal.id,
      title: goal.title,
      status: goal.status,
      areaSlug: area.slug,
      why: goal.why,
    })
    .from(goal)
    .innerJoin(area, eq(goal.areaId, area.id))
    .where(and(eq(goal.userId, userId), eq(goal.status, "active"), isNull(goal.archivedAt)))
    .orderBy(asc(goal.createdAt));

  const projectRows = await db
    .select({
      id: project.id,
      title: project.title,
      status: project.status,
      dueAt: project.dueAt,
      areaSlug: area.slug,
      openActions: sql<number>`count(${action.id}) filter (where ${action.status} in ('next','scheduled'))::int`,
    })
    .from(project)
    .innerJoin(area, eq(project.areaId, area.id))
    .leftJoin(action, and(eq(action.projectId, project.id), isNull(action.archivedAt)))
    .where(and(eq(project.userId, userId), isNull(project.archivedAt)))
    .groupBy(project.id, project.title, project.status, project.dueAt, area.slug)
    .orderBy(asc(project.createdAt));

  const projects: OverviewProject[] = projectRows.map((p) => ({
    ...p,
    hasNextAction: p.openActions > 0,
  }));

  const actions = await db
    .select({
      id: action.id,
      title: action.title,
      status: action.status,
      kind: action.kind,
      waitingOn: action.waitingOn,
      areaSlug: area.slug,
      projectTitle: project.title,
    })
    .from(action)
    .innerJoin(area, eq(action.areaId, area.id))
    .leftJoin(project, eq(action.projectId, project.id))
    .where(and(eq(action.userId, userId), isNull(action.archivedAt)))
    .orderBy(desc(action.createdAt));

  const byMode = <T extends { areaSlug: string }>(rows: T[]) =>
    mode ? rows.filter((r) => r.areaSlug === mode) : rows;

  return {
    goals: byMode(goals),
    projects: byMode(projects).filter((p) => p.status === "active"),
    nextActions: byMode(actions).filter((a) => a.status === "next" || a.status === "scheduled"),
    waiting: byMode(actions).filter((a) => a.status === "waiting"),
    someday: [
      ...byMode(projects).filter((p) => p.status === "someday"),
      ...byMode(actions).filter((a) => a.status === "someday"),
    ],
  };
}

export async function getActionById(userId: string, id: string) {
  const rows = await db
    .select()
    .from(action)
    .where(and(eq(action.userId, userId), eq(action.id, id)))
    .limit(1);
  return rows[0] ?? null;
}
