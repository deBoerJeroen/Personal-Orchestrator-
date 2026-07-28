import { db } from "@/db";
import { activityEvent } from "@/db/schema";
import { logger } from "./logger";

/**
 * Het gebeurtenislog is de basis onder motion-detectie, patronen en het
 * meetplan. Zonder dit weten we niet of de app werkt.
 *
 * `meta` bevat nooit vrije tekst — alleen ids, tellingen en enum-waarden.
 */
export type EventType =
  | "capture.created"
  | "inbox.processed"
  | "inbox.dropped"
  | "action.created"
  | "action.completed"
  | "action.postponed"
  | "action.dropped"
  | "action.shrunk"
  | "action.started"
  | "project.created"
  | "project.edited"
  | "goal.created"
  | "checkin.completed"
  | "intervention.shown"
  | "intervention.accepted";

type EventInput = {
  userId: string;
  type: EventType;
  entityType?: string;
  entityId?: string;
  meta?: Record<string, string | number | boolean>;
};

export async function recordEvent({ userId, type, entityType, entityId, meta = {} }: EventInput) {
  try {
    await db.insert(activityEvent).values({
      userId,
      type,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      meta,
    });
  } catch (error) {
    // Een mislukt event mag nooit een gebruikersactie blokkeren.
    logger.error("event.failed", { type, entityId, reason: (error as Error).name });
  }
}
