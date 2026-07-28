"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { action, checkIn, goal, inboxItem, project } from "@/db/schema";
import { recordEvent } from "./events";
import { MAX_ACTIVE_GOALS } from "./limits";
import { logger } from "./logger";
import { getAreaBySlug } from "./queries";
import { logicalDay } from "./rules/day";
import { requireUser } from "./session";

const areaSchema = z.enum(["werk", "prive"]);

async function resolveAreaId(userId: string, slug: "werk" | "prive") {
  const found = await getAreaBySlug(userId, slug);
  if (!found) throw new Error(`Gebied ${slug} ontbreekt. Draai \`pnpm seed\`.`);
  return found.id;
}

/* ------------------------------------------------------------------ *
 * Capture — de belangrijkste flow. Eén veld, geen beslissingen.
 * ------------------------------------------------------------------ */

const captureSchema = z.object({ text: z.string().trim().min(1).max(2000) });

export async function capture(formData: FormData) {
  const user = await requireUser();
  const parsed = captureSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success) return { ok: false as const, error: "Leeg" };

  const [created] = await db
    .insert(inboxItem)
    .values({ userId: user.id, rawText: parsed.data.text })
    .returning({ id: inboxItem.id });

  await recordEvent({
    userId: user.id,
    type: "capture.created",
    entityType: "inbox_item",
    entityId: created?.id,
    meta: { length: parsed.data.text.length },
  });

  revalidatePath("/nu");
  revalidatePath("/inbox");
  return { ok: true as const };
}

/* ------------------------------------------------------------------ *
 * Acties
 * ------------------------------------------------------------------ */

export async function completeAction(id: string) {
  const user = await requireUser();

  const [updated] = await db
    .update(action)
    .set({ status: "done", completedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(action.id, id), eq(action.userId, user.id)))
    .returning({ id: action.id, kind: action.kind, projectId: action.projectId });

  if (!updated) return { ok: false as const };

  await recordEvent({
    userId: user.id,
    type: "action.completed",
    entityType: "action",
    entityId: updated.id,
    meta: { kind: updated.kind },
  });

  revalidatePath("/nu");
  revalidatePath("/overzicht");
  return { ok: true as const };
}

export async function dropAction(id: string) {
  const user = await requireUser();

  await db
    .update(action)
    .set({ status: "dropped", archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(action.id, id), eq(action.userId, user.id)));

  await recordEvent({ userId: user.id, type: "action.dropped", entityType: "action", entityId: id });

  revalidatePath("/nu");
  revalidatePath("/overzicht");
  return { ok: true as const };
}

export async function postponeAction(id: string) {
  const user = await requireUser();

  await db
    .update(action)
    .set({ postponedCount: sql`${action.postponedCount} + 1`, updatedAt: new Date() })
    .where(and(eq(action.id, id), eq(action.userId, user.id)));

  await recordEvent({ userId: user.id, type: "action.postponed", entityType: "action", entityId: id });

  revalidatePath("/nu");
  return { ok: true as const };
}

/**
 * "Maak kleiner": maakt een startstap van maximaal twee minuten en zet de
 * oorspronkelijke actie op non-actief tot de startstap gedaan is.
 */
const shrinkSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(500),
});

export async function shrinkAction(formData: FormData) {
  const user = await requireUser();
  const parsed = shrinkSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
  });
  if (!parsed.success) return { ok: false as const, error: "Ongeldig" };

  const original = await db
    .select()
    .from(action)
    .where(and(eq(action.id, parsed.data.id), eq(action.userId, user.id)))
    .limit(1);

  const parent = original[0];
  if (!parent) return { ok: false as const, error: "Niet gevonden" };

  const [child] = await db
    .insert(action)
    .values({
      userId: user.id,
      areaId: parent.areaId,
      projectId: parent.projectId,
      parentActionId: parent.id,
      title: parsed.data.title,
      estimateMinutes: 2,
      context: parent.context,
      energy: "laag",
      source: "coach",
      status: "next",
    })
    .returning({ id: action.id });

  await recordEvent({
    userId: user.id,
    type: "action.shrunk",
    entityType: "action",
    entityId: parent.id,
    meta: { childId: child?.id ?? "" },
  });

  revalidatePath("/nu");
  return { ok: true as const, id: child?.id };
}

/* ------------------------------------------------------------------ *
 * Inbox verwerken
 * ------------------------------------------------------------------ */

const processSchema = z.object({
  itemId: z.string().uuid(),
  decision: z.enum(["action", "project", "someday", "reference", "drop", "done_now"]),
  area: areaSchema.optional(),
  outcome: z.string().trim().max(500).optional(),
  actionTitle: z.string().trim().max(500).optional(),
  kind: z.enum(["action", "motion"]).optional(),
  leadsTo: z.string().trim().max(500).optional(),
  dueAt: z.string().optional(),
});

export async function processInboxItem(formData: FormData) {
  const user = await requireUser();

  const parsed = processSchema.safeParse({
    itemId: formData.get("itemId"),
    decision: formData.get("decision"),
    area: formData.get("area") ?? undefined,
    outcome: formData.get("outcome") ?? undefined,
    actionTitle: formData.get("actionTitle") ?? undefined,
    kind: formData.get("kind") ?? undefined,
    leadsTo: formData.get("leadsTo") ?? undefined,
    dueAt: formData.get("dueAt") ?? undefined,
  });

  if (!parsed.success) {
    logger.warn("inbox.process.invalid", { reason: "schema" });
    return { ok: false as const, error: "Ongeldig" };
  }

  const { itemId, decision } = parsed.data;

  const rows = await db
    .select()
    .from(inboxItem)
    .where(and(eq(inboxItem.id, itemId), eq(inboxItem.userId, user.id)))
    .limit(1);

  const item = rows[0];
  if (!item) return { ok: false as const, error: "Niet gevonden" };

  if (decision === "drop" || decision === "reference") {
    await db
      .update(inboxItem)
      .set({
        status: decision === "drop" ? "dropped" : "processed",
        processedIntoType: decision,
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(inboxItem.id, itemId));

    await recordEvent({
      userId: user.id,
      type: decision === "drop" ? "inbox.dropped" : "inbox.processed",
      entityType: "inbox_item",
      entityId: itemId,
      meta: { decision },
    });

    revalidatePath("/inbox");
    revalidatePath("/nu");
    return { ok: true as const };
  }

  const areaSlug = parsed.data.area ?? "prive";
  const areaId = await resolveAreaId(user.id, areaSlug);
  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;

  let projectId: string | null = null;

  if (decision === "project") {
    const [created] = await db
      .insert(project)
      .values({
        userId: user.id,
        areaId,
        title: parsed.data.outcome || item.rawText,
        outcome: parsed.data.outcome ?? null,
        dueAt,
        status: "active",
      })
      .returning({ id: project.id });

    projectId = created?.id ?? null;

    await recordEvent({
      userId: user.id,
      type: "project.created",
      entityType: "project",
      entityId: projectId ?? undefined,
      meta: { area: areaSlug },
    });
  }

  if (decision === "someday") {
    await db.insert(action).values({
      userId: user.id,
      areaId,
      title: parsed.data.actionTitle || item.rawText,
      status: "someday",
      source: "inbox",
    });
  } else {
    // Ook bij "done_now" (de twee-minutenregel) leggen we de actie vast en
    // vinken hem direct af: anders verdwijnt het bewijs dat je iets deed.
    const isDoneNow = decision === "done_now";

    const [createdAction] = await db
      .insert(action)
      .values({
        userId: user.id,
        areaId,
        projectId,
        title: parsed.data.actionTitle || item.rawText,
        kind: parsed.data.kind ?? "action",
        leadsTo: parsed.data.leadsTo ?? null,
        dueAt: decision === "project" ? null : dueAt,
        status: isDoneNow ? "done" : "next",
        completedAt: isDoneNow ? new Date() : null,
        estimateMinutes: isDoneNow ? 2 : null,
        source: "inbox",
      })
      .returning({ id: action.id });

    await recordEvent({
      userId: user.id,
      type: isDoneNow ? "action.completed" : "action.created",
      entityType: "action",
      entityId: createdAction?.id,
      meta: { area: areaSlug, kind: parsed.data.kind ?? "action", twoMinuteRule: isDoneNow },
    });
  }

  await db
    .update(inboxItem)
    .set({
      status: "processed",
      processedIntoType: decision,
      processedIntoId: projectId,
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(inboxItem.id, itemId));

  await recordEvent({
    userId: user.id,
    type: "inbox.processed",
    entityType: "inbox_item",
    entityId: itemId,
    meta: { decision },
  });

  revalidatePath("/inbox");
  revalidatePath("/nu");
  revalidatePath("/overzicht");
  return { ok: true as const };
}

/* ------------------------------------------------------------------ *
 * Check-ins
 * ------------------------------------------------------------------ */

const checkInSchema = z.object({
  kind: z.enum(["morning", "evening"]),
  energy: z.coerce.number().min(1).max(5).optional(),
  mode: z.string().optional(),
  answers: z.record(z.string(), z.string()).optional(),
});

export async function saveCheckIn(formData: FormData) {
  const user = await requireUser();

  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("answer.") && typeof value === "string" && value.trim()) {
      answers[key.slice("answer.".length)] = value.trim();
    }
  }

  const parsed = checkInSchema.safeParse({
    kind: formData.get("kind"),
    energy: formData.get("energy") || undefined,
    mode: formData.get("mode") || undefined,
    answers,
  });

  if (!parsed.success) return { ok: false as const, error: "Ongeldig" };

  const today = logicalDay(new Date());

  await db
    .insert(checkIn)
    .values({
      userId: user.id,
      date: today,
      kind: parsed.data.kind,
      energy: parsed.data.energy ?? null,
      mode: parsed.data.mode ?? null,
      answers,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [checkIn.userId, checkIn.date, checkIn.kind],
      set: {
        energy: parsed.data.energy ?? null,
        mode: parsed.data.mode ?? null,
        answers,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

  // Bewust geen inhoud in het event: alleen dát er gereflecteerd is.
  await recordEvent({
    userId: user.id,
    type: "checkin.completed",
    entityType: "check_in",
    meta: { kind: parsed.data.kind, answered: Object.keys(answers).length },
  });

  // De avondcheck-in kan een actie voor morgen opleveren.
  const tomorrowAction = answers["tomorrow"];
  if (parsed.data.kind === "evening" && tomorrowAction) {
    const areaId = await resolveAreaId(user.id, "prive");
    await db.insert(action).values({
      userId: user.id,
      areaId,
      title: tomorrowAction,
      source: "checkin",
      status: "next",
    });
  }

  if (parsed.data.kind === "morning" && parsed.data.mode && parsed.data.mode !== "beide") {
    const store = await cookies();
    store.set("nu.mode", parsed.data.mode, { httpOnly: false, sameSite: "lax", path: "/" });
  }

  revalidatePath("/nu");
  return { ok: true as const };
}

/* ------------------------------------------------------------------ *
 * Doelen en projecten (minimaal — het zwaartepunt ligt bij acties)
 * ------------------------------------------------------------------ */

const goalSchema = z.object({
  title: z.string().trim().min(1).max(300),
  area: areaSchema,
  why: z.string().trim().max(1000).optional(),
});

export async function createGoal(formData: FormData) {
  const user = await requireUser();
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    area: formData.get("area"),
    why: formData.get("why") ?? undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "Ongeldig" };

  const active = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(goal)
    .where(and(eq(goal.userId, user.id), eq(goal.status, "active")));

  if ((active[0]?.count ?? 0) >= MAX_ACTIVE_GOALS) {
    return {
      ok: false as const,
      error: `Je hebt al ${MAX_ACTIVE_GOALS} actieve doelen. Pauzeer er eerst één.`,
    };
  }

  const areaId = await resolveAreaId(user.id, parsed.data.area);

  const [created] = await db
    .insert(goal)
    .values({ userId: user.id, areaId, title: parsed.data.title, why: parsed.data.why ?? null })
    .returning({ id: goal.id });

  await recordEvent({
    userId: user.id,
    type: "goal.created",
    entityType: "goal",
    entityId: created?.id,
    meta: { area: parsed.data.area },
  });

  revalidatePath("/overzicht");
  return { ok: true as const };
}

const quickActionSchema = z.object({
  title: z.string().trim().min(1).max(500),
  area: areaSchema,
  projectId: z.string().uuid().optional(),
  kind: z.enum(["action", "motion"]).optional(),
  leadsTo: z.string().trim().max(500).optional(),
});

export async function createAction(formData: FormData) {
  const user = await requireUser();
  const parsed = quickActionSchema.safeParse({
    title: formData.get("title"),
    area: formData.get("area"),
    projectId: formData.get("projectId") || undefined,
    kind: formData.get("kind") || undefined,
    leadsTo: formData.get("leadsTo") || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "Ongeldig" };

  const areaId = await resolveAreaId(user.id, parsed.data.area);

  const [created] = await db
    .insert(action)
    .values({
      userId: user.id,
      areaId,
      projectId: parsed.data.projectId ?? null,
      title: parsed.data.title,
      kind: parsed.data.kind ?? "action",
      leadsTo: parsed.data.leadsTo ?? null,
      source: "capture",
    })
    .returning({ id: action.id });

  await recordEvent({
    userId: user.id,
    type: "action.created",
    entityType: "action",
    entityId: created?.id,
    meta: { area: parsed.data.area, kind: parsed.data.kind ?? "action" },
  });

  revalidatePath("/nu");
  revalidatePath("/overzicht");
  return { ok: true as const };
}

export async function setMode(mode: "werk" | "prive" | "alles") {
  await requireUser();
  const store = await cookies();
  if (mode === "alles") store.delete("nu.mode");
  else store.set("nu.mode", mode, { httpOnly: false, sameSite: "lax", path: "/" });
  revalidatePath("/", "layout");
}
